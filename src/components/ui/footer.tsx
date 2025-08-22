"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
}

interface FooterLink {
  name: string;
  Icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  href?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: {
    name: string;
    description: string;
    logo?: string;
  };
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  copyright?: string;
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, brand, socialLinks, columns, copyright, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("pt-24", className)}
        {...props}
      >
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <a href="#" className="flex items-center gap-3 mb-3">
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    className="h-8 object-contain"
                  />
                )}
                <span className="text-xl font-semibold">{brand.name}</span>
              </a>
              <p className="text-sm text-foreground/60">
                {brand.description}
              </p>

              <div className="flex items-center gap-3 mt-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    className="flex items-center gap-2 text-sm transition-all text-foreground/60 hover:text-foreground/90 group"
                    target="_blank"
                    href={link.href}
                    rel="noopener noreferrer"
                  >
                    {link.icon && (
                      <link.icon className="h-5 w-5 transition-all stroke-foreground/60 group-hover:stroke-foreground/90" />
                    )}
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 mt-16 md:grid-cols-3 lg:col-span-8 lg:justify-items-end lg:mt-0">
              {columns.map(({ title, links }) => (
                <div key={title} className="last:mt-12 md:last:mt-0">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {links.map(({ name, Icon, href }) => (
                      <li key={name}>
                        <a
                          href={href || "#"}
                          className="text-sm transition-all text-foreground/60 hover:text-foreground/90 group"
                        >
                          <Icon className="inline stroke-2 h-4 mr-1.5 transition-all stroke-foreground/60 group-hover:stroke-foreground/90" />
                          {name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {copyright && (
            <div className="mt-20 border-t pt-6 pb-8">
              <p className="text-xs text-foreground/55">{copyright}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Footer.displayName = "Footer";


