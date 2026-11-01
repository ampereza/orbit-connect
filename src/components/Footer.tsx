import { Link } from "react-router-dom";

const columns = [
  { title: "Marketplace", links: [{l:"Find Work",t:"/jobs"},{l:"Find Freelancers",t:"/freelancers"},{l:"Browse Categories",t:"/categories"},{l:"Browse Jobs",t:"/jobs"}] },
  { title: "For Freelancers", links: [{l:"Create Profile",t:"/auth?mode=signup"},{l:"Resources",t:"/blog"},{l:"Portfolio Guide",t:"/guides"},{l:"Success Stories",t:"/testimonials"}] },
  { title: "For Employers", links: [{l:"Post a Job",t:"/jobs/new"},{l:"Hire Talent",t:"/freelancers"},{l:"Hiring Guide",t:"/guides"},{l:"Enterprise",t:"/enterprise"}] },
  { title: "Company", links: [{l:"About",t:"/about"},{l:"Contact",t:"/contact"},{l:"Blog",t:"/blog"},{l:"Careers",t:"/careers"}] },
  { title: "Support", links: [{l:"Help Center",t:"/help"},{l:"FAQs",t:"/faq"},{l:"Safety",t:"/safety"},{l:"Report Issue",t:"/report"}] },
  { title: "Legal", links: [{l:"Terms",t:"/terms"},{l:"Privacy",t:"/privacy"},{l:"Cookies",t:"/cookies"},{l:"Payment Policy",t:"/payment-policy"}] },
];

export const Footer = () => {
  return (
    <footer className="bg-[#101B32] text-white/80 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="font-semibold text-white mb-3">{c.title}</h4>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.l}><Link to={l.t} className="hover:text-white transition">{l.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/60">
          © 2025 Orbit Employ. All rights reserved.
        </div>
      </div>
    </footer>
  );
};