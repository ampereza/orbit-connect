-- Insert sample jobs
INSERT INTO public.jobs (title, country, description, requirements, salary_range, contract_type) VALUES
('Construction Worker', 'Saudi Arabia', 'General construction work including masonry, carpentry, and general labor. Accommodation and transportation provided.', ARRAY['2-3 years experience', 'Physically fit', 'Basic English'], '$800 - $1200/month', 'full-time'),
('Hotel Housekeeper', 'UAE', 'Housekeeping staff for luxury hotels. All meals and accommodation provided.', ARRAY['Previous hotel experience preferred', 'Attention to detail', 'Good hygiene'], '$600 - $900/month', 'full-time'),
('Factory Worker', 'Qatar', 'Manufacturing and assembly line work in industrial facilities.', ARRAY['No experience required', 'Willing to work shifts', 'Physically fit'], '$700 - $1000/month', 'full-time'),
('Caregiver/Nurse Assistant', 'Canada', 'Provide care for elderly and disabled individuals in private homes and care facilities.', ARRAY['Caregiving experience', 'First aid certified', 'Good communication skills'], 'CAD $2500 - $3500/month', 'full-time'),
('Truck Driver', 'Poland', 'Long-haul and local truck driving positions. Valid license required.', ARRAY['Valid driving license', '2+ years driving experience', 'Clean driving record'], '€1500 - €2500/month', 'full-time'),
('Software Engineer', 'Germany', 'Full-stack development role building web applications and services.', ARRAY['3+ years React', '3+ years Node.js', 'Computer Science degree'], '€5000 - €7000/month', 'full-time'),
('Data Analyst', 'Netherlands', 'Analyze business data and create dashboards to support decision making.', ARRAY['SQL', 'Python', 'Tableau'], '€3500 - €5000/month', 'full-time'),
('Marketing Specialist', 'Spain', 'Develop and execute marketing campaigns across digital channels.', ARRAY['SEO', 'Content creation', 'Analytics'], '€2500 - €4000/month', 'full-time'),
('HR Coordinator', 'UK', 'Handle recruitment onboarding and employee relations.', ARRAY['HR experience', 'Communication skills', 'Organizational skills'], '£30000 - £40000/year', 'full-time'),
('Sales Representative', 'USA', 'Generate new business opportunities and maintain client relationships.', ARRAY['CRM', 'Negotiation', 'Presentation skills'], '$60000 - $80000/year', 'full-time')
ON CONFLICT DO NOTHING;
