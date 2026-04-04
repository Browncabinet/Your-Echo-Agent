import logoIcon from "@/assets/echo_agent_logo.png";
import logoText from "@/assets/your_echo_agent_text.png";

interface LogoProps {
  size?: "sm" | "md";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const textHeight = size === "sm" ? "h-4" : "h-5";

  return (
    <div className="flex items-center gap-2">
      <img src={logoIcon} alt="Your Echo Agent" className={`${iconSize} object-contain`} />
      {showText && (
        <img src={logoText} alt="Your Echo Agent" className={`${textHeight} object-contain`} />
      )}
    </div>
  );
}
