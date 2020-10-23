// Source: http://www.cl.cam.ac.uk/~mgk25/ucs/examples/quickbrown.txt

export const UnicodeSamples = {
    danish: `Quizdeltagerne spiste jordbær med fløde, mens cirkusklovnen Wolther spillede på xylofon`,
    german: `Falsches Üben von Xylophonmusik quält jeden größeren Zwerg - Zwölf Boxkämpfer jagten Eva quer über den Sylter Deich - Heizölrückstoßabdämpfung`,
    greek: `Γαζέες καὶ μυρτιὲς δὲν θὰ βρῶ πιὰ στὸ χρυσαφὶ ξέφωτο - Ξεσκεπάζω τὴν ψυχοφθόρα βδελυγμία`,
    english: `The quick brown fox jumps over the lazy dog`,
    spanish: `El pingüino Wenceslao hizo kilómetros bajo exhaustiva lluvia y frío, añoraba a su querido cachorro`,
    french: `Portez ce vieux whisky au juge blond qui fume sur son île intérieure, à côté de l'alcôve ovoïde, où les bûches se consument dans l'âtre, ce qui lui permet de penser à la cænogenèse de l'être dont il est question dans la cause ambiguë entendue à Moÿ, dans un capharnaüm qui, pense-t-il, diminue çà et là la qualité de son œuvre - Le cœur déçu mais l'âme plutôt naïve, Louÿs rêva de crapaüter en canoë au delà des îles, près du mälström où brûlent les novæ`,
    irishGaelic: `D'fhuascail Íosa, Úrmhac na hÓighe Beannaithe, pór Éava agus Ádhaimh`,
    hungarian: `Árvíztűrő tükörfúrógép`,
    icelandic: `Kæmi ný öxi hér ykist þjófum nú bæði víl og ádrepa - Sævör grét áðan því úlpan var ónýt`,
    japanese: `いろはにほへとちりぬるを わかよたれそつねならむ うゐのおくやまけふこえて あさきゆめみしゑひもせす - イロハニホヘト チリヌルヲ ワカヨタレソ ツネナラム ウヰノオクヤマ ケフコエテ アサキユメミシ ヱヒモセスン`,
    hebrew: `דג סקרן שט בים מאוכזב ולפתע מצא לו חברה איך הקליטה`,
    polish: `Pchnąć w tę łódź jeża lub ośm skrzyń fig`,
    russian: `В чащах юга жил бы цитрус? Да, но фальшивый экземпляр! - Съешь же ещё этих мягких французских булок да выпей чаю`,
    thai: `๏ เป็นมนุษย์สุดประเสริฐเลิศคุณค่า กว่าบรรดาฝูงสัตว์เดรัจฉาน จงฝ่าฟันพัฒนาวิชาการ อย่าล้างผลาญฤๅเข่นฆ่าบีฑาใคร ไม่ถือโทษโกรธแช่งซัดฮึดฮัดด่า หัดอภัยเหมือนกีฬาอัชฌาสัย ปฏิบัติประพฤติกฎกำหนดใจ พูดจาให้จ๊ะๆ จ๋าๆ น่าฟังเอย ฯ`,
    turkish: `Pijamalı hasta, yağız şoföre çabucak güvendi`
};

export function createUnicodeTests(callback: (text: string) => void): void {
    for (let [language, text] of Object.entries(UnicodeSamples)) {
        test(language, () => {
            callback(text);
        });
    }
}
