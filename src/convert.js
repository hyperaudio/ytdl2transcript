const fs = require("fs");
const xml2js = require("xml2js");
const shortid = require("shortid");

const { id: ytid, subtitles } = require("../input/subs.info.json");
const { automatic_captions } = require("../input/auto-subs.info.json");

const DEBUG = true;

const generateID = () => {
  let id = null;
  do {
    id = shortid.generate();
  } while (!id.match(/^[a-z]([0-9]|[a-z])+([0-9a-z]+)[a-z]$/i));

  return id;
};

const main = () => {
  const queue = [
    ["subs", subtitles],
    ["auto-subs", automatic_captions]
  ]
    .reduce(
      (acc, [type, subs]) => [
        ...acc,
        ...Object.entries(subs).reduce(
          (acc, [lang, formats]) => [
            ...acc,
            ...formats.map(({ ext }) => ({
              lang,
              ext,
              type,
              file: `${type}.${lang}.${ext}`
            }))
          ],
          []
        )
      ],
      []
    )
    .filter(({ file }) => fs.existsSync(`./input/${file}`));
  // .filter(({ lang }) => lang === "ro");
  // .slice(0, 1);

  console.log(JSON.stringify(queue, null, 2));

  queue.forEach(({ lang, type, ext, file }) => {
    switch (ext) {
      case "srv3":
        convertSRV3(file, lang, type);
        break;

      default:
        console.warn(`Unknown format ${ext}`);
        break;
    }
  });
};

const convertSRV3 = async (file, lang, type) => {
  const data = await xml2js.parseStringPromise(
    fs.readFileSync(`./input/${file}`, { encoding: "utf-8" }),
    {
      attrkey: "attrs",
      charkey: "text",
      trim: true,
      explicitArray: true
    }
  );

  DEBUG &&
    fs.writeFileSync(
      `./debug/${file}.parsed.json`,
      JSON.stringify(data, null, 2),
      "utf8"
    );

  const paragraphs = data.timedtext.body[0].p
    .filter(({ s, text }) => !!s || !!text)
    .map(({ attrs: { t }, s = [], text }) => {
      const start = parseInt(t);

      const words = s.reduce(
        (acc, { attrs: { t = 0, ac = 0 }, text }, index) => [
          ...acc,
          {
            id: generateID(),
            start: start + parseInt(t),
            end: start + parseInt(t) + parseInt(ac),
            offset:
              index === 0
                ? 0
                : acc.map(({ text }) => text).join(" ").length + 1,
            length: text.length,
            text
          }
        ],
        []
      );
      return {
        id: generateID(),
        start,
        end: words.length > 0 ? words[words.length - 1].end : null,
        text: text ? text : words.map(({ text }) => text).join(" "),
        words
      };
    })
    .reverse()
    .reduce((acc, p) => {
      if (!p.end && acc.length > 0) p.end = acc[0].start;
      if (!p.words || p.words.length === 0) {
        p.words = p.text.split(" ").reduce(
          (acc, text, index, words) => [
            ...acc,
            {
              id: generateID(),
              start:
                p.start +
                Math.floor((index * (p.end - p.start)) / words.length),
              end:
                p.start +
                Math.floor(((index + 1) * (p.end - p.start)) / words.length),
              offset:
                index === 0
                  ? 0
                  : acc.map(({ text }) => text).join(" ").length + 1,
              length: text.length,
              text
            }
          ],
          []
        );
      }
      return [p, ...acc];
    }, []);

  DEBUG &&
    fs.writeFileSync(
      `./debug/${file}.paragraphs.json`,
      JSON.stringify(paragraphs, null, 2),
      "utf8"
    );

  const transcript = {
    id: generateID(),
    lang,
    paragraphs
  };

  fs.writeFileSync(
    `./output/${file}.json`,
    JSON.stringify(transcript, null, 2),
    "utf8"
  );
};

main();
