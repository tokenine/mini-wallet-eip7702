import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { button as buttonStyles } from "@heroui/theme";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Mini Wallet&nbsp;</span>
        <span className={title({ color: "violet" })}>EIP7702&nbsp;</span>
        <br />
        <span className="text-lg">
          is a flexible, signature-based smart contract wallet designed for secure and gasless transactions.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          The power of EIP-7702
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>

      <div className="mt-8 ">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started to testing
          </span>
        </Snippet>
      </div>

      <Link
        className={buttonStyles({
          color: "primary",
          radius: "full",
          variant: "shadow",
        })}
        href="/login"
      >
        Let's go
      </Link>

    </section>
  );
}
