import { cn } from "@/lib/utils"

type FooterProps = {
  title?: string
  copyText: string
  links?: readonly string[]
  className?: string
  titleClassName?: string
  copyClassName?: string
  linksClassName?: string
  linkClassName?: string
}

const defaultLinks = ["Privacy Policy", "Terms", "Security"] as const

export function Footer({
  title,
  copyText,
  links = defaultLinks,
  className,
  titleClassName,
  copyClassName,
  linksClassName,
  linkClassName,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn("flex w-full flex-col items-center justify-between gap-6", className)}>
      <div className={cn(title ? "flex flex-col gap-1" : undefined)}>
        {title ? <h2 className={titleClassName}>{title}</h2> : null}
        <p className={copyClassName}>
          © {currentYear} Resumatrix. {copyText}
        </p>
      </div>

      <div className={cn("flex flex-wrap justify-center gap-6 md:justify-end md:gap-8", linksClassName)}>
        {links.map((link) => (
          <a key={link} href="#" className={linkClassName}>
            {link}
          </a>
        ))}
      </div>
    </footer>
  )
}
