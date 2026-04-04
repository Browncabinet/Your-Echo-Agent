import logoIcon from "@/assets/echo_agent_logo.png";
import logoText from "@/assets/your_echo_agent_text.png";

interface LogoProps {
  size?: "sm" | "md";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const textHeight = size === "sm" ? "h-8" : "h-9";

  return (
    <div className="flex items-center gap-2">
      <img src={logoIcon} alt="Your Echo Agent" className={`${iconSize} object-contain`} />
      {showText && (
        <img src={logoText} alt="Your Echo Agent" className={`${textHeight} object-contain`} />
      )}
    </div>
  );
}
