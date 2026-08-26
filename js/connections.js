/* Connections: welche Figuren marvel.com bei einer Figur nebeneinander
   stellt.

   Geholt von den Charakterseiten dort (marvel.com/characters/<slug>), wo
   derselbe Abschnitt steht, und auf unsere Schlüssel übersetzt. Es ist
   die Auswahl von Marvel selbst und keine Rechnung aus gemeinsamen
   Filmen: Deshalb steht hier, wer wirklich zu einer Figur gehört, und
   nicht jeder, der einmal im selben Bild stand.

   slug -> [Ziel-Slug, ...], in der Reihenfolge der Vorlage.

   Auf der Charakterseite kommen sie hinter den benannten Beziehungen aus
   CHAR_BONDS (js/facts.js): Was von Hand gepflegt ist, steht vorn und
   trägt seine Bezeichnung auf der Karte, der Rest füllt auf. Figuren, die
   auf marvel.com keine eigene Seite haben oder dort keinen solchen
   Abschnitt tragen, fehlen hier einfach – sie leben dann von ihren
   CHAR_BONDS allein.

   Gepflegt wird das nicht von Hand. Wer nachlegen will, nimmt
   CHAR_BONDS: Dort steht auch, was die beiden füreinander sind. */
const CHAR_CONNECTIONS = {
  'carol-danvers': [
    'monica-rambeau', 'kamala-khan-ms-marvel', 'nick-fury', 'maria-rambeau', 'dar-benn',
    'valkyrie', 'muneeba-khan', 'aamir-khan',
  ],
  'nick-fury': [
    'maria-hill', 'talos', 'g-iah', 'everett-ross', 'james-rhodes', 'sonya-falsworth',
    'gravik',
  ],
  'talos': [
    'nick-fury', 'maria-hill', 'g-iah', 'gravik', 'james-rhodes', 'sonya-falsworth',
    'everett-ross',
  ],
  'yon-rogg': ['carol-danvers', 'nick-fury', 'talos', 'maria-rambeau', 'phil-coulson'],
  'maria-rambeau': [
    'carol-danvers', 'monica-rambeau', 'kamala-khan-ms-marvel', 'nick-fury', 'talos',
    'yon-rogg', 'valkyrie', 'muneeba-khan', 'aamir-khan', 'dar-benn',
  ],
  'phil-coulson': [
    'nick-fury', 'carol-danvers', 'steve-rogers', 'tony-stark', 'natasha-romanoff',
    'thor', 'james-rhodes', 'vision', 'clint-barton', 'erik-selvig',
  ],
  'natasha-romanoff': ['alexei', 'taskmaster', 'rick-mason'],
  'thor': ['korg', 'valkyrie', 'zeus'],
  'loki': ['ravonna-renslayer', 'hunter-b-15', 'miss-minutes'],
  'jane-foster': ['thor', 'valkyrie', 'korg', 'zeus'],
  'clint-barton': [
    'kate-bishop', 'maya-lopez-echo', 'eleanor-bishop', 'natasha-romanoff',
    'steve-rogers', 'wanda-maximoff', 'sam-wilson', 'tony-stark', 'james-rhodes',
    'vision', 'peter-parker', 'thor', 'bruce-banner', 'erik-selvig', 'phil-coulson',
  ],
  'maria-hill': [
    'nick-fury', 'james-rhodes', 'everett-ross', 'talos', 'g-iah', 'sonya-falsworth',
    'gravik',
  ],
  'trevor-slattery': ['simon-williams'],
  'wanda-maximoff': [
    'stephen-strange', 'wong', 'america-chavez', 'christine-palmer', 'karl-mordo-838',
  ],
  'sharon-carter': [
    'nick-fury', 'maria-hill', 'natasha-romanoff', 'steve-rogers', 'sam-wilson',
    'bucky-barnes',
  ],
  'peter-quill': [
    'gamora', 'rocket', 'groot', 'drax', 'mantis', 'nebula', 'cosmo', 'kraglin', 'yondu',
    'tony-stark', 'peter-parker', 'stephen-strange', 'thor',
  ],
  'gamora': [
    'peter-quill', 'nebula', 'rocket', 'groot', 'drax', 'mantis', 'kraglin', 'cosmo',
    'yondu', 'thor',
  ],
  'drax': [
    'peter-quill', 'gamora', 'mantis', 'rocket', 'groot', 'nebula', 'cosmo', 'kraglin',
    'yondu', 'thor', 'peter-parker', 'tony-stark', 'stephen-strange',
  ],
  'rocket': [
    'groot', 'cosmo', 'kraglin', 'peter-quill', 'gamora', 'drax', 'mantis', 'nebula',
    'thor', 'yondu', 'steve-rogers', 'vision', 't-challa', 'okoye', 'shuri',
    'natasha-romanoff', 'wanda-maximoff', 'bruce-banner', 'sam-wilson', 'james-rhodes',
    'bucky-barnes',
  ],
  'groot': [
    'rocket', 'cosmo', 'kraglin', 'peter-quill', 'gamora', 'drax', 'mantis', 'nebula',
    'yondu', 'thor', 'steve-rogers', 't-challa', 'wanda-maximoff', 'sam-wilson',
    'james-rhodes', 'okoye', 'natasha-romanoff', 'bucky-barnes', 'bruce-banner',
    'vision', 'shuri',
  ],
  'kraglin': [
    'peter-quill', 'rocket', 'groot', 'drax', 'mantis', 'nebula', 'gamora', 'cosmo',
    'yondu', 'thor',
  ],
  'nebula': [
    'gamora', 'peter-quill', 'rocket', 'drax', 'groot', 'mantis', 'cosmo', 'kraglin',
    'yondu', 'stephen-strange', 'peter-parker', 'tony-stark',
  ],
  'mantis': [
    'drax', 'peter-quill', 'gamora', 'rocket', 'groot', 'nebula', 'kraglin', 'cosmo',
    'yondu', 'tony-stark', 'stephen-strange', 'peter-parker',
  ],
  'scott-lang': ['hope-van-dyne', 'janet-van-dyne', 'hank-pym', 'cassie-lang'],
  'hank-pym': ['janet-van-dyne', 'hope-van-dyne', 'scott-lang'],
  'hope-van-dyne': ['scott-lang', 'janet-van-dyne', 'hank-pym', 'cassie-lang'],
  'cassie-lang': ['scott-lang', 'hope-van-dyne', 'hank-pym', 'janet-van-dyne'],
  'everett-ross': [
    't-challa', 'shuri', 'riri-williams', 'okoye', 'nakia', 'm-baku', 'namor',
  ],
  'yelena-belova': [
    'natasha-romanoff', 'alexei', 'taskmaster', 'rick-mason', 'clint-barton',
    'kate-bishop', 'maya-lopez-echo', 'kazi-kazimierczak', 'eleanor-bishop',
  ],
  'alexei': ['natasha-romanoff', 'taskmaster'],
  'taskmaster': ['natasha-romanoff', 'alexei'],
  'rick-mason': ['natasha-romanoff'],
  'shuri': [
    't-challa', 'okoye', 'nakia', 'riri-williams', 'everett-ross', 'm-baku', 'namor',
  ],
  'okoye': [
    't-challa', 'nakia', 'shuri', 'm-baku', 'everett-ross', 'riri-williams', 'namor',
  ],
  'nakia': [
    't-challa', 'okoye', 'shuri', 'm-baku', 'everett-ross', 'riri-williams', 'namor',
  ],
  'm-baku': [
    't-challa', 'shuri', 'okoye', 'nakia', 'everett-ross', 'riri-williams', 'namor',
  ],
  'stephen-strange': [
    'wong', 'wanda-maximoff', 'america-chavez', 'christine-palmer', 'karl-mordo-838',
  ],
  'wong': [
    'stephen-strange', 'wanda-maximoff', 'america-chavez', 'christine-palmer',
    'karl-mordo-838',
  ],
  'christine-palmer': [
    'stephen-strange', 'wong', 'america-chavez', 'wanda-maximoff', 'karl-mordo-838',
  ],
  'valkyrie': [
    'carol-danvers', 'monica-rambeau', 'kamala-khan-ms-marvel', 'nick-fury',
    'muneeba-khan', 'aamir-khan', 'maria-rambeau', 'dar-benn',
  ],
  'korg': ['thor', 'valkyrie', 'zeus'],
  'janet-van-dyne': ['hank-pym', 'hope-van-dyne', 'scott-lang'],
  'sylvie': ['loki', 'miss-minutes', 'ravonna-renslayer', 'hunter-b-15'],
  'ravonna-renslayer': ['loki', 'hunter-b-15', 'miss-minutes'],
  'hunter-b-15': ['loki', 'ravonna-renslayer', 'miss-minutes'],
  'miss-minutes': ['loki', 'hunter-b-15', 'ravonna-renslayer'],
  'agatha-harkness': ['stephen-strange', 'wanda-maximoff'],
  'monica-rambeau': [
    'carol-danvers', 'kamala-khan-ms-marvel', 'maria-rambeau', 'nick-fury', 'dar-benn',
    'valkyrie', 'muneeba-khan', 'aamir-khan',
  ],
  'billy-maximoff-wiccan': [
    'cassie-lang', 'kate-bishop', 'wanda-maximoff', 'vision', 'steve-rogers',
    'stephen-strange', 'johnny-storm-human-torch', 'carol-danvers',
  ],
  'shang-chi': ['katy', 'ying-nan', 'wenwu-mandarin', 'xialing', 'death-dealer'],
  'katy': ['shang-chi', 'ying-nan', 'xialing', 'wenwu-mandarin', 'death-dealer'],
  'wenwu-mandarin': ['shang-chi', 'ying-nan', 'death-dealer', 'xialing', 'katy'],
  'xialing': ['shang-chi', 'katy', 'ying-nan', 'death-dealer', 'wenwu-mandarin'],
  'ying-nan': ['wenwu-mandarin', 'katy', 'shang-chi', 'xialing', 'death-dealer'],
  'death-dealer': ['shang-chi', 'wenwu-mandarin', 'xialing', 'ying-nan', 'katy'],
  'john-walker': [
    'taskmaster', 'steve-rogers', 'james-rhodes', 'wanda-maximoff', 'tony-stark',
    'clint-barton', 'maria-hill',
  ],
  'sersi': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'phastos', 'sprite',
    'thena',
  ],
  'ikaris': [
    'ajak', 'druig', 'gilgamesh', 'kingo', 'makkari', 'phastos', 'sersi', 'sprite',
    'thena',
  ],
  'thena': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'phastos', 'sersi',
    'sprite',
  ],
  'kingo': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'makkari', 'phastos', 'sersi', 'sprite',
    'thena',
  ],
  'sprite': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'phastos', 'sersi',
    'thena',
  ],
  'druig': [
    'ajak', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'phastos', 'sersi', 'sprite',
    'thena',
  ],
  'makkari': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'kingo', 'phastos', 'sersi', 'sprite',
    'thena',
  ],
  'phastos': [
    'ajak', 'druig', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'sersi', 'sprite',
    'thena',
  ],
  'ajak': [
    'druig', 'gilgamesh', 'ikaris', 'kingo', 'makkari', 'phastos', 'sersi', 'sprite',
    'thena',
  ],
  'gilgamesh': [
    'ajak', 'druig', 'ikaris', 'kingo', 'makkari', 'phastos', 'sersi', 'sprite', 'thena',
  ],
  'dane-whitman': [
    'stephen-strange', 'hercules', 'johnny-storm-human-torch', 'namor', 'sersi',
    'jennifer-walters-she-hulk', 'thena', 'valkyrie', 'janet-van-dyne', 'darren-cross',
  ],
  'green-goblin': ['peter-parker', 'electro', 'sandman', 'curt-connors'],
  'doc-ock': ['peter-parker', 'green-goblin', 'electro', 'sandman', 'curt-connors'],
  'sandman': ['peter-parker', 'electro', 'curt-connors', 'green-goblin'],
  'america-chavez': [
    'stephen-strange', 'wong', 'wanda-maximoff', 'karl-mordo-838', 'christine-palmer',
  ],
  'clea': [
    'stephen-strange', 'bruce-banner', 'nick-fury', 'silver-surfer', 'valkyrie', 'wong',
  ],
  'karl-mordo-838': [
    'stephen-strange', 'wong', 'wanda-maximoff', 'america-chavez', 'christine-palmer',
  ],
  'kate-bishop': ['clint-barton', 'maya-lopez-echo', 'kazi-kazimierczak', 'eleanor-bishop'],
  'maya-lopez-echo': ['kazi-kazimierczak', 'kate-bishop', 'clint-barton', 'eleanor-bishop'],
  'eleanor-bishop': ['kate-bishop', 'clint-barton', 'maya-lopez-echo', 'kazi-kazimierczak'],
  'kazi-kazimierczak': ['maya-lopez-echo', 'kate-bishop', 'clint-barton', 'eleanor-bishop'],
  'kamala-khan-ms-marvel': [
    'carol-danvers', 'monica-rambeau', 'nick-fury', 'dar-benn', 'muneeba-khan',
    'aamir-khan', 'maria-rambeau', 'valkyrie',
  ],
  'muneeba-khan': [
    'kamala-khan-ms-marvel', 'aamir-khan', 'monica-rambeau', 'carol-danvers', 'dar-benn',
    'nick-fury', 'valkyrie', 'maria-rambeau',
  ],
  'aamir-khan': [
    'kamala-khan-ms-marvel', 'muneeba-khan', 'monica-rambeau', 'carol-danvers',
    'dar-benn', 'nick-fury', 'valkyrie', 'maria-rambeau',
  ],
  'zeus': ['thor', 'valkyrie', 'korg', 'hercules'],
  'jennifer-walters-she-hulk': [
    'nikki-ramos', 'titania', 'bruce-banner', 'wong', 'matt-murdock-daredevil',
  ],
  'nikki-ramos': ['jennifer-walters-she-hulk', 'titania'],
  'titania': ['jennifer-walters-she-hulk', 'nikki-ramos'],
  'namor': ['m-baku', 'shuri', 'riri-williams', 'everett-ross', 'okoye', 'nakia'],
  'riri-williams': ['shuri', 'okoye', 'nakia', 'everett-ross', 'm-baku', 'namor'],
  'cosmo': [
    'rocket', 'groot', 'kraglin', 'peter-quill', 'gamora', 'mantis', 'drax', 'nebula',
  ],
  'gravik': [
    'g-iah', 'talos', 'nick-fury', 'maria-hill', 'james-rhodes', 'everett-ross',
    'sonya-falsworth',
  ],
  'g-iah': [
    'talos', 'nick-fury', 'maria-hill', 'everett-ross', 'james-rhodes',
    'sonya-falsworth', 'gravik',
  ],
  'sonya-falsworth': [
    'nick-fury', 'maria-hill', 'james-rhodes', 'everett-ross', 'g-iah', 'talos',
    'gravik',
  ],
  'dar-benn': [
    'carol-danvers', 'monica-rambeau', 'kamala-khan-ms-marvel', 'nick-fury',
    'muneeba-khan', 'aamir-khan', 'valkyrie', 'maria-rambeau',
  ],
  'reed-richards-mister-fantastic': [
    'sue-storm-invisible-woman', 'johnny-storm-human-torch', 'ben-grimm-the-thing',
    'tony-stark', 'bruce-banner', 't-challa',
  ],
  'simon-williams': ['trevor-slattery'],
};
