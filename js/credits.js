/* Stab und Einordnung zu jedem Titel: was das Fenster auf films.html
   zeigt und was in js/data.js nicht steht.

   data.js beschreibt, was in einem Titel passiert – Handlung, Key
   Moments, wer auftritt. Wer ihn gemacht hat, gehört nicht dazu, deshalb
   steht es hier. Die Besetzung fehlt in dieser Datei bewusst: Sie ergibt
   sich aus den Figuren des Titels und ACTORS in data.js, siehe
   castOf() in js/films.js.

   Schlüssel ist der Titel aus data.js, nicht der Slug. Loki und Daredevil
   teilen sich über ihre Staffeln je einen Slug, haben aber verschiedene
   Regie und verschiedene Autoren; ihre Titel sind dagegen eindeutig.

   Felder, alle freiwillig – was fehlt, lässt das Fenster einfach weg:

     imdb       Bewertung auf IMDb, eine Nachkommastelle
     fsk        deutsche Altersfreigabe als Zahl
     genre      zwei bis drei Schlagworte, durch Komma getrennt
     regie      Regie; bei Serien die Regie der Folgen
     drehbuch   Drehbuch; bei Serien die Idee bzw. das Showrunning
     produktion Produktion

   Die Bewertungen stammen aus dem offiziellen Datensatz von IMDb,
   title.ratings.tsv.gz unter https://datasets.imdbws.com/. Er wird
   täglich neu gelegt, die Zahlen hier sind also ein Stand und kein
   Abruf – wer sie auffrischt, holt den Datensatz erneut und schreibt
   die Zeilen neu. Eine Serie hat auf IMDb eine Bewertung für alle
   Staffeln zusammen; ihre Staffeln tragen deshalb dieselbe Zahl.

   Nicht gefüllt sind die Stellen, an denen die Angabe unsicher wäre:
   die Altersfreigaben der meisten Serien und der Stab der Titel, die zum
   Zeitpunkt dieser Datei noch nicht gelaufen waren. Was noch nicht
   gelaufen ist, hat auch keine Bewertung. Lieber eine Zeile weniger im
   Fenster als eine falsche. Wer sie nachträgt, ändert nur diese
   Datei. */

const FILM_CREDITS = {
  /* ---------- Phase 1 ---------- */

  'Captain America: The First Avenger': {
    imdb: 6.9,
    fsk: 12,
    genre: 'Abenteuer & Action, Superhelden, Zweiter Weltkrieg',
    regie: 'Joe Johnston',
    drehbuch: 'Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },
  'Captain Marvel': {
    imdb: 6.7,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Anna Boden, Ryan Fleck',
    drehbuch: 'Anna Boden, Ryan Fleck, Geneva Robertson-Dworet',
    produktion: 'Kevin Feige',
  },
  'Iron Man': {
    imdb: 7.9,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Jon Favreau',
    drehbuch: 'Mark Fergus, Hawk Ostby, Art Marcum, Matt Holloway',
    produktion: 'Avi Arad, Kevin Feige',
  },
  'Iron Man 2': {
    imdb: 6.9,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Jon Favreau',
    drehbuch: 'Justin Theroux',
    produktion: 'Kevin Feige',
  },
  'The Incredible Hulk': {
    imdb: 6.6,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Louis Leterrier',
    drehbuch: 'Zak Penn',
    produktion: 'Avi Arad, Gale Anne Hurd, Kevin Feige',
  },
  'Thor': {
    imdb: 7.0,
    fsk: 12,
    genre: 'Abenteuer & Action, Fantasy, Superhelden',
    regie: 'Kenneth Branagh',
    drehbuch: 'Ashley Edward Miller, Zack Stentz, Don Payne',
    produktion: 'Kevin Feige',
  },
  "Marvel's The Avengers": {
    imdb: 8.0,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Joss Whedon',
    drehbuch: 'Joss Whedon',
    produktion: 'Kevin Feige',
  },

  /* ---------- Phase 2 ---------- */

  'Thor: The Dark World': {
    imdb: 6.7,
    fsk: 12,
    genre: 'Abenteuer & Action, Fantasy, Superhelden',
    regie: 'Alan Taylor',
    drehbuch: 'Christopher Yost, Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },
  'Iron Man 3': {
    imdb: 7.1,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Shane Black',
    drehbuch: 'Drew Pearce, Shane Black',
    produktion: 'Kevin Feige',
  },
  'Captain America: The Winter Soldier': {
    imdb: 7.7,
    fsk: 12,
    genre: 'Abenteuer & Action, Thriller, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    drehbuch: 'Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },
  'Guardians of the Galaxy': {
    imdb: 8.0,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Komödie',
    regie: 'James Gunn',
    drehbuch: 'James Gunn, Nicole Perlman',
    produktion: 'Kevin Feige',
  },
  'Guardians of the Galaxy Vol. 2': {
    imdb: 7.6,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Komödie',
    regie: 'James Gunn',
    drehbuch: 'James Gunn',
    produktion: 'Kevin Feige',
  },
  'Avengers: Age of Ultron': {
    imdb: 7.3,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Joss Whedon',
    drehbuch: 'Joss Whedon',
    produktion: 'Kevin Feige',
  },
  'Ant-Man': {
    imdb: 7.2,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Komödie',
    regie: 'Peyton Reed',
    drehbuch: 'Edgar Wright, Joe Cornish, Adam McKay, Paul Rudd',
    produktion: 'Kevin Feige',
  },

  /* ---------- Phase 3 ---------- */

  'Captain America: Civil War': {
    imdb: 7.8,
    fsk: 12,
    genre: 'Abenteuer & Action, Thriller, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    drehbuch: 'Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },
  'Black Widow': {
    imdb: 6.6,
    fsk: 12,
    genre: 'Abenteuer & Action, Spionage, Superhelden',
    regie: 'Cate Shortland',
    drehbuch: 'Eric Pearson',
    produktion: 'Kevin Feige',
  },
  'Black Panther': {
    imdb: 7.3,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Ryan Coogler',
    drehbuch: 'Ryan Coogler, Joe Robert Cole',
    produktion: 'Kevin Feige',
  },
  'Spider-Man: Homecoming': {
    imdb: 7.4,
    fsk: 12,
    genre: 'Abenteuer & Action, Komödie, Superhelden',
    regie: 'Jon Watts',
    drehbuch: 'Jonathan Goldstein, John Francis Daley, Jon Watts, Christopher Ford, Chris McKenna, Erik Sommers',
    produktion: 'Kevin Feige, Amy Pascal',
  },
  'Doctor Strange': {
    imdb: 7.5,
    fsk: 12,
    genre: 'Abenteuer & Action, Fantasy, Superhelden',
    regie: 'Scott Derrickson',
    drehbuch: 'Jon Spaihts, Scott Derrickson, C. Robert Cargill',
    produktion: 'Kevin Feige',
  },
  'Thor: Ragnarok': {
    imdb: 7.9,
    fsk: 12,
    genre: 'Abenteuer & Action, Komödie, Superhelden',
    regie: 'Taika Waititi',
    drehbuch: 'Eric Pearson, Craig Kyle, Christopher Yost',
    produktion: 'Kevin Feige',
  },
  'Ant-Man and the Wasp': {
    imdb: 7.0,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Komödie',
    regie: 'Peyton Reed',
    drehbuch: 'Chris McKenna, Erik Sommers, Paul Rudd, Andrew Barrer, Gabriel Ferrari',
    produktion: 'Kevin Feige, Stephen Broussard',
  },
  'Avengers: Infinity War': {
    imdb: 8.4,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    drehbuch: 'Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },
  'Avengers: Endgame': {
    imdb: 8.4,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    drehbuch: 'Christopher Markus, Stephen McFeely',
    produktion: 'Kevin Feige',
  },

  /* ---------- Phase 4 ---------- */

  'Loki – Staffel 1': {
    imdb: 8.2,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Kate Herron',
    drehbuch: 'Michael Waldron',
    produktion: 'Kevin Feige',
  },
  'WandaVision': {
    imdb: 7.9,
    genre: 'Superhelden, Mystery, Sitcom',
    regie: 'Matt Shakman',
    drehbuch: 'Jac Schaeffer',
    produktion: 'Kevin Feige',
  },
  'Shang-Chi and the Legend of the Ten Rings': {
    imdb: 7.3,
    fsk: 12,
    genre: 'Abenteuer & Action, Martial Arts, Fantasy',
    regie: 'Destin Daniel Cretton',
    drehbuch: 'Dave Callaham, Destin Daniel Cretton, Andrew Lanham',
    produktion: 'Kevin Feige, Jonathan Schwartz',
  },
  'The Falcon and the Winter Soldier': {
    imdb: 7.1,
    genre: 'Abenteuer & Action, Thriller, Superhelden',
    regie: 'Kari Skogland',
    drehbuch: 'Malcolm Spellman',
    produktion: 'Kevin Feige',
  },
  'Spider-Man: Far From Home': {
    imdb: 7.3,
    fsk: 12,
    genre: 'Abenteuer & Action, Komödie, Superhelden',
    regie: 'Jon Watts',
    drehbuch: 'Chris McKenna, Erik Sommers',
    produktion: 'Kevin Feige, Amy Pascal',
  },
  'Eternals': {
    imdb: 6.2,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Drama',
    regie: 'Chloé Zhao',
    drehbuch: 'Chloé Zhao, Patrick Burleigh, Ryan Firpo, Kaz Firpo',
    produktion: 'Kevin Feige, Nate Moore',
  },
  'Spider-Man: No Way Home': {
    imdb: 8.1,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Jon Watts',
    drehbuch: 'Chris McKenna, Erik Sommers',
    produktion: 'Kevin Feige, Amy Pascal',
  },
  'Doctor Strange in the Multiverse of Madness': {
    imdb: 6.8,
    fsk: 12,
    genre: 'Abenteuer & Action, Fantasy, Horror',
    regie: 'Sam Raimi',
    drehbuch: 'Michael Waldron',
    produktion: 'Kevin Feige',
  },
  'Hawkeye': {
    imdb: 7.4,
    genre: 'Abenteuer & Action, Superhelden, Weihnachten',
    regie: 'Rhys Thomas, Bert & Bertie',
    drehbuch: 'Jonathan Igla',
    produktion: 'Kevin Feige',
  },
  'Deadpool & Wolverine': {
    imdb: 7.5,
    fsk: 16,
    genre: 'Abenteuer & Action, Komödie, Superhelden',
    regie: 'Shawn Levy',
    drehbuch: 'Ryan Reynolds, Rhett Reese, Paul Wernick, Zeb Wells, Shawn Levy',
    produktion: 'Kevin Feige, Shawn Levy, Ryan Reynolds, Lauren Shuler Donner',
  },
  'Moon Knight': {
    imdb: 7.3,
    genre: 'Abenteuer & Action, Mystery, Fantasy',
    regie: 'Mohamed Diab, Justin Benson, Aaron Moorhead',
    drehbuch: 'Jeremy Slater',
    produktion: 'Kevin Feige',
  },
  'Ms. Marvel': {
    imdb: 6.2,
    genre: 'Abenteuer & Action, Coming-of-Age, Superhelden',
    regie: 'Adil El Arbi & Bilall Fallah, Meera Menon, Sharmeen Obaid-Chinoy',
    drehbuch: 'Bisha K. Ali',
    produktion: 'Kevin Feige',
  },
  'Thor: Love and Thunder': {
    imdb: 6.1,
    fsk: 12,
    genre: 'Abenteuer & Action, Komödie, Fantasy',
    regie: 'Taika Waititi',
    drehbuch: 'Taika Waititi, Jennifer Kaytin Robinson',
    produktion: 'Kevin Feige, Brad Winderbaum',
  },
  'She-Hulk: Attorney at Law': {
    imdb: 5.2,
    genre: 'Komödie, Superhelden, Anwaltsserie',
    regie: 'Kat Coiro, Anu Valia',
    drehbuch: 'Jessica Gao',
    produktion: 'Kevin Feige',
  },
  'Black Panther: Wakanda Forever': {
    imdb: 6.6,
    fsk: 12,
    genre: 'Abenteuer & Action, Drama, Superhelden',
    regie: 'Ryan Coogler',
    drehbuch: 'Ryan Coogler, Joe Robert Cole',
    produktion: 'Kevin Feige, Nate Moore',
  },

  /* ---------- Phase 5 ---------- */

  'Loki – Staffel 2': {
    imdb: 8.2,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Justin Benson & Aaron Moorhead, Dan DeLeeuw, Kasra Farahani',
    drehbuch: 'Eric Martin',
    produktion: 'Kevin Feige',
  },
  'Ant-Man and the Wasp: Quantumania': {
    imdb: 6.0,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Komödie',
    regie: 'Peyton Reed',
    drehbuch: 'Jeff Loveness',
    produktion: 'Kevin Feige, Stephen Broussard',
  },
  'Guardians of the Galaxy Vol. 3': {
    imdb: 7.9,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Drama',
    regie: 'James Gunn',
    drehbuch: 'James Gunn',
    produktion: 'Kevin Feige',
  },
  'Secret Invasion': {
    imdb: 5.8,
    genre: 'Thriller, Spionage, Science-Fiction',
    regie: 'Ali Selim',
    drehbuch: 'Kyle Bradstreet',
    produktion: 'Kevin Feige',
  },
  'Echo': {
    imdb: 5.9,
    fsk: 16,
    genre: 'Abenteuer & Action, Krimi, Drama',
    regie: 'Sydney Freeland, Catriona McKenzie',
    drehbuch: 'Marion Dayre',
    produktion: 'Kevin Feige, Brad Winderbaum',
  },
  'The Marvels': {
    imdb: 5.4,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Nia DaCosta',
    drehbuch: 'Nia DaCosta, Megan McDonnell, Elissa Karasik',
    produktion: 'Kevin Feige',
  },
  'Agatha All Along': {
    imdb: 7.2,
    genre: 'Mystery, Fantasy, Dark Comedy',
    regie: 'Jac Schaeffer, Gandja Monteiro, Rachel Goldberg',
    drehbuch: 'Jac Schaeffer',
    produktion: 'Kevin Feige',
  },
  'Captain America: Brave New World': {
    imdb: 5.6,
    fsk: 12,
    genre: 'Abenteuer & Action, Thriller, Superhelden',
    regie: 'Julius Onah',
    drehbuch: 'Rob Edwards, Malcolm Spellman, Dalan Musson, Julius Onah, Peter Glanz',
    produktion: 'Kevin Feige, Nate Moore',
  },
  'Daredevil: Born Again – Staffel 1': {
    imdb: 8.1,
    fsk: 16,
    genre: 'Abenteuer & Action, Krimi, Drama',
    regie: 'Justin Benson & Aaron Moorhead, Michael Cuesta, Jeffrey Nachmanoff, David Boyd',
    drehbuch: 'Dario Scardapane',
    produktion: 'Kevin Feige, Brad Winderbaum',
  },
  'Ironheart': {
    imdb: 4.5,
    genre: 'Abenteuer & Action, Science-Fiction, Drama',
    regie: 'Sam Bailey, Angela Barnes',
    drehbuch: 'Chinaka Hodge',
    produktion: 'Kevin Feige',
  },
  'Thunderbolts*': {
    imdb: 7.1,
    fsk: 12,
    genre: 'Abenteuer & Action, Thriller, Superhelden',
    regie: 'Jake Schreier',
    drehbuch: 'Eric Pearson, Joanna Calo',
    produktion: 'Kevin Feige',
  },

  /* ---------- Phase 6 ----------

     Ab hier wird es dünner: Was noch nicht gelaufen ist, hat oft nur eine
     angekündigte Regie und noch keine Freigabe. */

  'The Fantastic Four: First Steps': {
    imdb: 6.8,
    fsk: 12,
    genre: 'Abenteuer & Action, Science-Fiction, Retro-Futurismus',
    regie: 'Matt Shakman',
    drehbuch: 'Josh Friedman, Eric Pearson, Jeff Kaplan, Ian Springer',
    produktion: 'Kevin Feige',
  },
  'Wonder Man': {
    imdb: 7.4,
    genre: 'Komödie, Drama, Hollywood-Satire',
    drehbuch: 'Andrew Guest, Destin Daniel Cretton',
    produktion: 'Kevin Feige',
  },
  'Daredevil: Born Again – Staffel 2': {
    imdb: 8.1,
    genre: 'Abenteuer & Action, Krimi, Drama',
    drehbuch: 'Dario Scardapane',
    produktion: 'Kevin Feige',
  },
  'Daredevil: Born Again – Staffel 3': {
    genre: 'Abenteuer & Action, Krimi, Drama',
    drehbuch: 'Dario Scardapane',
    produktion: 'Kevin Feige',
  },
  'The Punisher: One Last Kill': {
    imdb: 7.0,
    genre: 'Abenteuer & Action, Krimi, Thriller',
    produktion: 'Kevin Feige',
  },
  'Spider-Man: Brand New Day': {
    imdb: 8.0,
    genre: 'Abenteuer & Action, Komödie, Superhelden',
    regie: 'Destin Daniel Cretton',
    drehbuch: 'Chris McKenna, Erik Sommers',
    produktion: 'Kevin Feige, Amy Pascal',
  },
  'VisionQuest': {
    genre: 'Science-Fiction, Drama, Superhelden',
    drehbuch: 'Terry Matalas',
    produktion: 'Kevin Feige',
  },
  'Avengers: Doomsday': {
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    drehbuch: 'Stephen McFeely, Michael Waldron',
    produktion: 'Kevin Feige',
  },
  'Avengers: Secret Wars': {
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Anthony Russo, Joe Russo',
    produktion: 'Kevin Feige',
  },

  /* ---------- Phase 7 ----------

     Alles noch ungedreht. Was hier steht, ist das, was Marvel selbst
     angekündigt hat, mehr nicht. */

  'X-Men': {
    genre: 'Abenteuer & Action, Science-Fiction, Superhelden',
    regie: 'Jake Schreier',
    drehbuch: 'Michael Lesslie, Lee Sung Jin, Joanna Calo',
    produktion: 'Kevin Feige',
  },
  'Ghost Rider': {
    genre: 'Abenteuer & Action, Horror, Superhelden',
    regie: 'Shawn Levy',
    drehbuch: 'Jonathan Tropper',
    produktion: 'Kevin Feige',
  },
  'Black Panther 3': {
    genre: 'Abenteuer & Action, Drama, Superhelden',
    regie: 'Ryan Coogler',
    produktion: 'Kevin Feige',
  },
};
