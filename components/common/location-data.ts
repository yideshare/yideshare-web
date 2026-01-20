/*  A central place for all pickable locations – ASCII spaces only  */
export interface LocationItem {
    label: string;
    address: string;
  }
  
  export const LOCATIONS: LocationItem[] = [
    /* ——— Transportation ——— */
    { label: "Union Station (NHV)", address: "50 Union Ave, New Haven CT 06519" },
    { label: "Tweed New Haven Airport (HVN)", address: "155 Burr St, New Haven CT 06512" },
    { label: "Bradley Intl Airport (BDL)", address: "Schoephoester Rd, Windsor Locks CT 06096" },
    { label: "JFK Airport", address: "Queens NY 11430" },
    { label: "LaGuardia Airport (LGA)", address: "Queens NY 11371" },
    { label: "Newark Liberty Airport (EWR)", address: "3 Brewster Rd, Newark NJ 07114" },
    { label: "State Street Station", address: " 370 State St, New Haven CT 06510" },
    
    /* ——— Yale Colleges ——— */
    { label: "Silliman College", address: "505 College St, New Haven CT 06511" },
    { label: "Timothy Dwight", address: "345 Temple St, New Haven CT 06511" },
    { label: "Berkeley College", address: "165 Elm St, New Haven CT 06511" },
    { label: "Branford College", address: "74 High St, New Haven CT 06511" },
    { label: "Saybrook College", address: "242 Elm St, New Haven CT 06511" },
    { label: "Pierson College", address: "261 Park St, New Haven CT 06511" },
    { label: "Trumbull College", address: "95 Wall St, New Haven CT 06511" },
    { label: "Ezra Stiles College", address: "77 High St, New Haven CT 06511" },
    { label: "Morse College", address: "34 Hillhouse Ave, New Haven CT 06511" },
    { label: "Davenport College", address: "250 Elm St, New Haven CT 06511" },
    { label: "Jonathan Edwards College", address: "68 High St, New Haven CT 06511" },
    { label: "Benjamin Franklin College", address: "90 High St, New Haven CT 06511" },
    { label: "Pauli Murray College", address: "130 Prospect St, New Haven CT 06511" },
    { label: "Grace Hopper College", address: "189 Elm St, New Haven CT 06511" },

    /* ——— Yale campus ——— */
    { label: "Yale Old Campus", address: "344 College St, New Haven CT 06511" },
    { label: "Kline Tower (Science Hill)", address: "219 Prospect St, New Haven CT 06511" },
    { label: "Yale Law School", address: "127 Wall St, New Haven CT 06511" },
    { label: "Yale School of Management (SOM)", address: "165 Whitney Ave, New Haven CT 06511" },
    { label: "Yale School of Medicine", address: "333 Cedar St, New Haven CT 06510" },
    { label: "Yale Peabody Museum", address: "170 Whitney Ave, New Haven CT 06511" },
    { label: "Yale University Art Gallery (YUAG)", address: "1111 Chapel St, New Haven CT 06510" },
    { label: "Sterling Memorial Library", address: "120 High St, New Haven CT 06511" },
    { label: "Bass Library", address: "110 Wall St, New Haven CT 06511" },
    { label: "Payne Whitney Gym", address: "70 Tower Pkwy, New Haven CT 06511" },
    { label: "Yale Schwarzman Center", address: "168 Grove St, New Haven CT 06511" },
    { label: "Yale Divinity School", address: "409 Prospect St, New Haven CT 06511" },

    /* ——— Outdoors / downtown ——— */
    { label: "East Rock Park", address: "41 Cold Spring St, New Haven CT 06511" },
    { label: "New Haven Green", address: "250 Temple St, New Haven CT 06511" },

        /* ——— Student hot‑spots ——— */
    { label: "Yale Bowl", address: "81 Central Ave, New Haven CT 06515" },
    { label: "Toad's Place", address: "300 York St, New Haven CT 06511" },
    { label: "The Yale Bookstore", address: "77 Broadway, New Haven CT 06511" },
    { label: "Atticus Bookstore Cafe", address: "1082 Chapel St, New Haven CT 06510" },
    { label: "Claire's Corner Copia", address: "1000 Chapel St, New Haven CT 06510" },
    { label: "Frank Pepe Pizzeria Napoletana", address: "157 Wooster St, New Haven CT 06511" },
    { label: "Sally's Apizza New Haven", address: "237 Wooster St, New Haven CT 06511" },
  
    /* ——— Shopping / essentials ——— */
    { label: "IKEA New Haven", address: "450 Sargent Dr, New Haven CT 06511" },
    { label: "Target New Haven", address: "310 Foxon Blvd, New Haven CT 06513" },
    { label: "Trader Joe's (Orange CT)", address: "230 Boston Post Rd, Orange CT 06477" },
    { label: "Stop & Shop (Whalley Ave)", address: "150 Whalley Ave, New Haven CT 06511" },
    { label: "Harvard University", address: "1256 Massachusetts Ave, Cambridge MA 02138" }
  ];
  