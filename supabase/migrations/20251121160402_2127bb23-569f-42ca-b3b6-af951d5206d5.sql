-- Grant admin role to the first user (info@swissrosekw.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('f28301c9-ead3-47c9-9024-0bd12078c9bf', 'admin')
ON CONFLICT DO NOTHING;