import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export interface Skill {
  name: string;
  description: string;
  content: string;
}

export function loadSkills(): Skill[] {
  const skillsDir = join(process.cwd(), ".coder", "skills");
  let files: string[];
  try {
    files = readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  return files.map((file) => {
    const raw = readFileSync(join(skillsDir, file), "utf-8");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      return { name: file.replace(".md", ""), description: "", content: raw };
    }

    const frontmatter = match[1];
    const content = match[2].trim();

    const name =
      frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() ??
      file.replace(".md", "");
    const description =
      frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? "";

    return { name, description, content };
  });
}
