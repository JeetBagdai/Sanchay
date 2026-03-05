import fs from 'fs';
import { MODULES } from '../lib/constants';

const keys: Record<string, string> = {};

MODULES.forEach((mod) => {
    mod.cards.forEach((card, cIdx) => {
        if (card.type === "concept" || card.type === "example") {
            if (card.title) keys[`mod.${mod.id}.c.${cIdx}.title`] = card.title;
            if (card.content) keys[`mod.${mod.id}.c.${cIdx}.content`] = card.content;
        } else if (card.type === "quiz") {
            if (card.question) keys[`mod.${mod.id}.c.${cIdx}.question`] = card.question;
            card.options?.forEach((opt, oIdx) => {
                keys[`mod.${mod.id}.c.${cIdx}.opt.${oIdx}`] = opt;
            });
            if (card.explanation) keys[`mod.${mod.id}.c.${cIdx}.expl`] = card.explanation;
        }
    });
});

fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2), 'utf-8');
console.log("Done");
