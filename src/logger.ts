import chalk from "chalk";

let _prefix = "";

export function setLogPrefix(prefix: string): void {
  _prefix = prefix;
}

export function logAction(message: string): void {
  const tag = _prefix ? `${_prefix} ${message}` : message;
  console.log(chalk.gray(`\n[${tag}]`));
}

export function logError(message: string): void {
  console.log(chalk.red(`[${message}]`));
}
