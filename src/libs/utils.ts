import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const { argv } = yargs(hideBin(process.argv));

export const getArgumentValuesOrDefault = ({
  flag,
  defaultValue = "",
}: {
  flag: string;
  defaultValue?: string;
}): string => {
  const value = argv[flag] as string;
  return value || defaultValue;
};
