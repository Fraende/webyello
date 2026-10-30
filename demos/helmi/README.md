# Kampaamo Helmi – WebYello demo 4

Kuvitteellinen art deco -henkinen kampaamo Helsingissä. Staattinen yhden tiedoston sivusto: ei build-vaihetta, ei kolmansia osapuolia, ei evästeitä.

Tiedostot: index.html (HTML, CSS ja JS samassa tiedostossa), fonts/ (Poiret One ja Josefin Sans, itse hostattuina, SIL OFL), assets/hero-poster.webp (demosivun kortin kuva).
Esikatselu: `python3 -m http.server` repon juuressa ja avaa /demos/helmi/. Fontit ladataan absoluuttisella polulla /demos/helmi/fonts/.

Sisältö
- Hero: piirtyvä kultainen auringonsäde Helsingin siluetin takana (Tuomiokirkko, Kallion kirkko, rautatieaseman torni, Uspenski), parallaksi hiirellä ja vierityksellä.
- Palvelut ja hinnat, kampaajat kaarikehyksissä, 4-vaiheinen ajanvaraus (palvelu → kampaaja → aika → tiedot) leimatulla lipulla ja .ics-kalenteritiedostolla.
- Kauppa: kuusi tuotetta, hover-paljastus, ostoskori (localStorage).
- Galleria, aukioloajat, yhteystiedot, kartta-linkki OpenStreetMapiin (ei upotusta).

Huomioitavaa
- Ajanvaraus ja kassa ovat demoja: mitään ei lähetetä eikä tallenneta palvelimelle. Varatut ajat arvotaan selaimessa.
- Hinnat, osoite, puhelin, sähköposti ja kampaajien nimet ovat paikkamerkkejä.
- Kuvat ovat koodilla piirrettyjä kuvituksia, eivät valokuvia. Ei keksittyjä arvosteluja, asiakasnimiä tai lukuja.
- prefers-reduced-motion pysäyttää animaatiot.
