export type Choice = "A" | "B" | "C";

export const ASPECTS = [
  {
    key: "resultaatgerichtheid",
    title: "Resultaatgerichtheid",
    intro:
      "Op de hoogte zijn van de leerdoelen van het project en de te leveren prestaties; weten hoe getoetst en beoordeeld wordt.",
    phases: {
      A: "Een enkeling is op de hoogte.",
      B: "Enkelen zijn op de hoogte.",
      C: "Elk groepslid is op de hoogte."
    }
  },
  {
    key: "betrokkenheid_loyaliteit",
    title: "Betrokkenheid en loyaliteit",
    intro: "De mate waarin groepsleden interesse tonen en verantwoordelijkheid nemen voor het groepswerk.",
    phases: {
      A: "Groepsleden hebben amper interesse in hoe de organisatie draait en doen niet meer dan wat van hen wordt gevraagd.",
      B: "Groepsleden lezen de informatie, stellen af en toe een vraag en zijn soms bereid iets extra te doen.",
      C: "Groepsleden weten goed hoe de groep ervoor staat, denken actief mee en hebben veel over voor het werk."
    }
  },
  {
    key: "vernieuwend_vermogen",
    title: "Vernieuwend vermogen",
    intro: "De mate waarin de groep openstaat voor verbetering en zelf met ideeën komt.",
    phases: {
      A: "De groep heeft geen interesse in verbetering of vernieuwing en komt zelf niet met ideeën.",
      B: "Men komt af en toe met een verbeteringsvoorstel en kijkt de kat uit de boom.",
      C: "De groep komt zelf met voorstellen en suggesties en toont betrokkenheid tot en met de realisatie."
    }
  },
  {
    key: "klantdenken",
    title: "Klant-denken",
    intro: "De mate waarin de groep zich inleeft in de klant en zich verantwoordelijk voelt voor de oplossing.",
    phases: {
      A: "De groep kan zich niet verplaatsen in de positie van de klant en voelt zich niet verantwoordelijk voor de problemen van de klant.",
      B: "De groep kan verwoorden wat het probleem van de klant is en in welke richting oplossingen gezocht moeten worden.",
      C: "De groep heeft zich het probleem van de klant eigen gemaakt en voelt zich verantwoordelijk voor de kwaliteit van het product."
    }
  },
  {
    key: "communicatiepatronen",
    title: "Communicatiepatronen",
    intro: "Hoe de groep overlegt en feedback vraagt.",
    phases: {
      A: "De groep heeft geen behoefte aan overleg onderling of met anderen en wil geen feedback over haar functioneren.",
      B: "De groep komt wekelijks bijeen omdat het zo hoort, maar weet niet goed wat te bespreken of te informeren.",
      C: "De groep neemt zelf initiatief tot overleggen, betrekt zo nodig personen van buiten en wil feedback over haar functioneren."
    }
  },
  {
    key: "samenwerking",
    title: "Samenwerking",
    intro: "Hoe sterk de groepsband is en in hoeverre groepsleden elkaar helpen en vervangen.",
    phases: {
      A: "De groep hangt als los zand aan elkaar. Men werkt voor zichzelf en iedereen moet zichzelf maar redden.",
      B: "Men kent elkaar redelijk en houdt daar rekening mee; men kan elkaar gedeeltelijk vervangen.",
      C: "De groep heeft een hechte band, houdt rekening met elkaar en anticipeert op elkaars afwezigheid."
    }
  },
  {
    key: "conflicthantering",
    title: "Conflicthantering",
    intro: "Hoe de groep omgaat met tegengestelde meningen en spanningen.",
    phases: {
      A: "Tegenovergestelde meningen en gedrag zijn in de groep onbespreekbaar en discussie wordt vermeden.",
      B: "Tegengestelde meningen en gedrag kunnen soms wel en soms niet besproken worden.",
      C: "Tegengestelde meningen en gedrag zijn bespreekbaar, worden uitgepraat en leiden tot verbeteringen."
    }
  },
  {
    key: "sturen_coachen",
    title: "Sturen en coachen",
    intro: "De mate van zelfsturing binnen de groep.",
    phases: {
      A: "De groep heeft een sterke behoefte aan sturing ten aanzien van taken en verantwoordelijkheden.",
      B: "De groep heeft regelmatige twijfels of onenigheid en daarbij behoefte aan sturing van bovenaf.",
      C: "De groep stuurt zichzelf ten aanzien van taken, verantwoordelijkheden en gedrag."
    }
  },
  {
    key: "omgangsvormen",
    title: "Omgangsvormen",
    intro: "Hoe veilig en bespreekbaar gedrag en normen in de groep zijn.",
    phases: {
      A: "Hoe zich te gedragen is onbespreekbaar; er is geen basis voor vertrouwen.",
      B: "Over een aantal zaken bestaan gemeenschappelijke regels en normen, maar niet alles is bespreekbaar.",
      C: "Omgangsvormen en gedrag zijn bespreekbaar; er is een brede basis van vertrouwen."
    }
  }
] as const;
