INSERT INTO public.user_roles (user_id, role)
VALUES ('2a5b77ff-7869-4f9f-97b4-8da357670ea3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;