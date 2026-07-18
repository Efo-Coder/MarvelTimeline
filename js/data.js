/* Alle MCU-Kinofilme, gruppiert nach Phasen (Reihenfolge = US-Kinostart,
   genau wie Marvel Studios die Phasen selbst aufteilt).

   Logos: Lege ein transparentes PNG unter  assets/logos/<slug>.png  ab
   (z. B. assets/logos/iron-man.png). Fehlt die Datei, zeigt die Seite
   automatisch den stilisierten Filmtitel als Platzhalter an.

   nebula = [Akzent A, Akzent B, kühle Basis] als RGB-Werte für die
   Galaxie-Nebel der jeweiligen Phase. accent = Akzentfarbe fürs UI. */

const PHASES = [
  {
    num: 1,
    id: "phase-1",
    title: "Phase One",
    saga: "The Infinity Saga",
    years: "2008 – 2012",
    accent: "#ffa63c",
    nebula: [[255, 160, 60], [255, 96, 48], [70, 84, 205]],
    movies: [
      { title: "Iron Man",                            date: "2. Mai 2008",   slug: "iron-man" },
      { title: "The Incredible Hulk",                 date: "13. Juni 2008", slug: "the-incredible-hulk" },
      { title: "Iron Man 2",                          date: "7. Mai 2010",   slug: "iron-man-2" },
      { title: "Thor",                                date: "6. Mai 2011",   slug: "thor" },
      { title: "Captain America: The First Avenger",  date: "22. Juli 2011", slug: "captain-america-the-first-avenger" },
      { title: "Marvel's The Avengers",               date: "4. Mai 2012",   slug: "the-avengers" },
    ],
  },
  {
    num: 2,
    id: "phase-2",
    title: "Phase Two",
    saga: "The Infinity Saga",
    years: "2013 – 2015",
    accent: "#ff4d4d",
    nebula: [[255, 72, 72], [205, 48, 140], [62, 72, 195]],
    movies: [
      { title: "Iron Man 3",                          date: "3. Mai 2013",   slug: "iron-man-3" },
      { title: "Thor: The Dark World",                date: "8. Nov. 2013",  slug: "thor-the-dark-world" },
      { title: "Captain America: The Winter Soldier", date: "4. Apr. 2014",  slug: "captain-america-the-winter-soldier" },
      { title: "Guardians of the Galaxy",             date: "1. Aug. 2014",  slug: "guardians-of-the-galaxy" },
      { title: "Avengers: Age of Ultron",             date: "1. Mai 2015",   slug: "avengers-age-of-ultron" },
      { title: "Ant-Man",                             date: "17. Juli 2015", slug: "ant-man" },
    ],
  },
  {
    num: 3,
    id: "phase-3",
    title: "Phase Three",
    saga: "The Infinity Saga",
    years: "2016 – 2019",
    accent: "#a855f7",
    nebula: [[170, 82, 255], [96, 56, 230], [52, 120, 220]],
    movies: [
      { title: "Captain America: Civil War",          date: "6. Mai 2016",   slug: "captain-america-civil-war" },
      { title: "Doctor Strange",                      date: "4. Nov. 2016",  slug: "doctor-strange" },
      { title: "Guardians of the Galaxy Vol. 2",      date: "5. Mai 2017",   slug: "guardians-of-the-galaxy-vol-2" },
      { title: "Spider-Man: Homecoming",              date: "7. Juli 2017",  slug: "spider-man-homecoming" },
      { title: "Thor: Ragnarok",                      date: "3. Nov. 2017",  slug: "thor-ragnarok" },
      { title: "Black Panther",                       date: "16. Feb. 2018", slug: "black-panther" },
      { title: "Avengers: Infinity War",              date: "27. Apr. 2018", slug: "avengers-infinity-war" },
      { title: "Ant-Man and the Wasp",                date: "6. Juli 2018",  slug: "ant-man-and-the-wasp" },
      { title: "Captain Marvel",                      date: "8. März 2019",  slug: "captain-marvel" },
      { title: "Avengers: Endgame",                   date: "26. Apr. 2019", slug: "avengers-endgame" },
      { title: "Spider-Man: Far From Home",           date: "2. Juli 2019",  slug: "spider-man-far-from-home" },
    ],
  },
  {
    num: 4,
    id: "phase-4",
    title: "Phase Four",
    saga: "The Multiverse Saga",
    years: "2021 – 2022",
    accent: "#34d6a0",
    nebula: [[52, 214, 160], [32, 165, 125], [45, 110, 220]],
    movies: [
      { title: "Black Widow",                                  date: "9. Juli 2021",  slug: "black-widow" },
      { title: "Shang-Chi and the Legend of the Ten Rings",    date: "3. Sep. 2021",  slug: "shang-chi" },
      { title: "Eternals",                                     date: "5. Nov. 2021",  slug: "eternals" },
      { title: "Spider-Man: No Way Home",                      date: "17. Dez. 2021", slug: "spider-man-no-way-home" },
      { title: "Doctor Strange in the Multiverse of Madness",  date: "6. Mai 2022",   slug: "doctor-strange-in-the-multiverse-of-madness" },
      { title: "Thor: Love and Thunder",                       date: "8. Juli 2022",  slug: "thor-love-and-thunder" },
      { title: "Black Panther: Wakanda Forever",               date: "11. Nov. 2022", slug: "black-panther-wakanda-forever" },
    ],
  },
  {
    num: 5,
    id: "phase-5",
    title: "Phase Five",
    saga: "The Multiverse Saga",
    years: "2023 – 2025",
    accent: "#4d8cff",
    nebula: [[72, 140, 255], [56, 84, 230], [140, 80, 230]],
    movies: [
      { title: "Ant-Man and the Wasp: Quantumania",   date: "17. Feb. 2023", slug: "ant-man-and-the-wasp-quantumania" },
      { title: "Guardians of the Galaxy Vol. 3",      date: "5. Mai 2023",   slug: "guardians-of-the-galaxy-vol-3" },
      { title: "The Marvels",                         date: "10. Nov. 2023", slug: "the-marvels" },
      { title: "Deadpool & Wolverine",                date: "26. Juli 2024", slug: "deadpool-and-wolverine" },
      { title: "Captain America: Brave New World",    date: "14. Feb. 2025", slug: "captain-america-brave-new-world" },
      { title: "Thunderbolts*",                       date: "2. Mai 2025",   slug: "thunderbolts" },
    ],
  },
  {
    num: 6,
    id: "phase-6",
    title: "Phase Six",
    saga: "The Multiverse Saga",
    years: "2025 – 2027",
    accent: "#ff46b5",
    nebula: [[255, 72, 180], [145, 62, 255], [60, 84, 210]],
    movies: [
      { title: "The Fantastic Four: First Steps",     date: "25. Juli 2025", slug: "the-fantastic-four-first-steps" },
      { title: "Spider-Man: Brand New Day",           date: "31. Juli 2026", slug: "spider-man-brand-new-day", upcoming: true },
      { title: "Avengers: Doomsday",                  date: "18. Dez. 2026", slug: "avengers-doomsday", upcoming: true },
      { title: "Avengers: Secret Wars",               date: "17. Dez. 2027", slug: "avengers-secret-wars", upcoming: true },
    ],
  },
];

/* Nebelfarben, solange keine Phase aktiv ist (Hero/Seitenanfang):
   die Akzentfarben aller sechs Phasen – die Galaxie zeigt dort also das
   komplette Spektrum der Timeline. */
const DEFAULT_NEBULA = PHASES.map(p => {
  const n = parseInt(p.accent.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
});
const DEFAULT_ACCENT = "#4d8cff";
