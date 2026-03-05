
const fs = require("fs");
let code = fs.readFileSync("app/dashboard/page.tsx", "utf8");

const needle = "const title = lang === \"hi\" && mod.titleHi ? mod.titleHi : mod.title;\r\n                                    const description = lang === \"hi\" && mod.descriptionHi ? mod.descriptionHi : mod.description;";
const replacement = `
                                    // Translate modules for both dashboard and modules pages
                                    const titleOrig = t("module." + mod.id + ".title");
                                    const title = titleOrig !== "module." + mod.id + ".title" ? titleOrig : (lang === "hi" && mod.titleHi ? mod.titleHi : mod.title);
                                    const descOrig = t("module." + mod.id + ".desc");
                                    const description = descOrig !== "module." + mod.id + ".desc" ? descOrig : (lang === "hi" && mod.descriptionHi ? mod.descriptionHi : mod.description);`;

if(code.indexOf(needle) !== -1) {
    code = code.replace(needle, replacement.trim());
    fs.writeFileSync("app/dashboard/page.tsx", code, "utf8");
    console.log("Successfully replaced module titles and descriptions in dashboard");
} else {
    console.log("Needle not found, perhaps already patched? Searching mod.titleHi:");
    console.log(code.substring(code.indexOf("mod.titleHi") - 50, code.indexOf("mod.titleHi") + 150));
}

