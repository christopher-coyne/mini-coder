import chalk from "chalk";

export function logAction(message: string): void {
  console.log(chalk.yellow(`\n[${message}]`));
}

export function logError(message: string): void {
  console.log(chalk.red(`[${message}]`));
}
