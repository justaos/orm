const { cwd } = Deno;
import { renderFileToString } from "https://deno.land/x/dejs@0.10.3/mod.ts";

const version = Deno.readTextFileSync(`${cwd()}/VERSION`);

const output = await renderFileToString(`${cwd()}/README.template.md`, {
  version
});

Deno.writeTextFileSync(`${cwd()}/README.md`, output + "");
