import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface OTPVerification {
  id: string;
  phone: string;
  otp: string;
  expires_at: string;
  verified: boolean;
  created_at: string;
}

const OTPManagement = () => {
  const [otpAttempts, setOtpAttempts] = useState<OTPVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOTPAttempts();
  }, []);

  const fetchOTPAttempts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("otp_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOtpAttempts(data || []);
    } catch (error: any) {
      console.error("Error fetching OTP attempts:", error);
      toast.error("Failed to load OTP verifications");
    } finally {
      setLoading(false);
    }
  };

  const deleteOTPAttempt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this OTP attempt?")) return;

    try {
      const { error } = await supabase
        .from("otp_verifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("OTP attempt deleted");
      fetchOTPAttempts();
    } catch (error: any) {
      console.error("Error deleting OTP attempt:", error);
      toast.error("Failed to delete OTP attempt");
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (attempt: OTPVerification) => {
    if (attempt.verified) {
      return <Badge variant="default" className="bg-green-600">Verified</Badge>;
    }
    if (isExpired(attempt.expires_at)) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">View and manage WhatsApp OTP verification attempts</p>
        <Button onClick={fetchOTPAttempts} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OTP Verification Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : otpAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No OTP verification attempts found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>OTP Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otpAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.phone}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {attempt.otp}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(attempt)}</TableCell>
                      <TableCell>
                        {format(new Date(attempt.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className={isExpired(attempt.expires_at) ? "text-destructive" : ""}>
                          {format(new Date(attempt.expires_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteOTPAttempt(attempt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{otpAttempts.length}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {otpAttempts.filter(a => a.verified).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {otpAttempts.filter(a => !a.verified && !isExpired(a.expires_at)).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {otpAttempts.filter(a => !a.verified && isExpired(a.expires_at)).length}
              </div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPManagement;
