function clearToTwoChild(elem) {
    while(elem.children.length > 2) elem.removeChild(elem.children[1]);
}
function clearToNoChild(elem) {
    while(elem.children.length > 0) elem.removeChild(elem.children[0]);
}
document.addEventListener("DOMContentLoaded", function() {
    var header = document.querySelector("header");
    
    if(window.scrollY == 0) header.classList.add("trans");
    header.style.transition = "color 0.5s, background 0.5s";
    
    window.addEventListener("scroll", checkScroll);
    
    if(window.innerWidth < 600) {
        header.classList.add("mobile");
        document.getElementById("open-menu").addEventListener("click", function() {
            header.classList.toggle("open");
        });
    }
    
    function checkScroll() {
        requestAnimationFrame(function buffer() {
            if(window.scrollY == 0) header.classList.add("trans"); 
            else header.classList.remove("trans"); 
        });
    }
});
window.addEventListener("load", function() {
    setTimeout(function() {
    var tVSes = document.querySelectorAll(".text-vert-swap");
    
    
    for(var i = 0; i < tVSes.length; i++) {
        let tVS = tVSes[i];
        let terms = Array.from(tVS.children).map(function(x) { return x.textContent; });
        
        let initialBox = tVS.getBoundingClientRect();
        
        //pin width and height
        tVS.style.width = initialBox.width + "px";
        tVS.style.height = initialBox.height + "px";
        
        //overflow is hidden at first to prevent flash of unstyled options. Disable that so the opacity transitions look nice
        tVS.style.overflow = "visible";
        
        clearToTwoChild(tVS);
        
        tVS.children[0].style.position = 
            tVS.children[1].style.position = 
            "absolute";
        
        let initial, lastTerm = -1, duration = 5000, direction = 1, slideTime = 0.8;
        requestAnimationFrame(function anim(time) {
            if(!initial) initial = time;
            let elapsed = time - initial;
            
            let animElapsed = (elapsed % duration)/duration;
            let termsElapsed = animElapsed*terms.length;
            
            let term = Math.floor(termsElapsed);
            let termAnimElapsed = termsElapsed - term;
            
            //half is just a static state
            if(termAnimElapsed < slideTime) termAnimElapsed = 0;
            else termAnimElapsed = (termAnimElapsed - slideTime) * (1/(1-slideTime));
            
            if(term != lastTerm) {
                lastTerm = term;
                direction = (Math.random()-0.5>0)?-1:1;
                
                tVS.children[0].textContent = terms[term];
                tVS.children[1].textContent = terms[ terms.length == term + 1 ? 0 : term + 1 ];
            }
            
            tVS.children[0].style.transform = `translateY(${direction*termAnimElapsed*initialBox.height}px)`;
            tVS.children[0].style.opacity = 1 - getOpacity(termAnimElapsed);
            
            tVS.children[1].style.opacity = getOpacity(termAnimElapsed);
            tVS.children[1].style.transform = `translateY(${-direction*(1-termAnimElapsed)*initialBox.height}px)`;
            
            requestAnimationFrame(anim); 
        });
    }
    
    function getOpacity(animPercent) {
        return (animPercent*animPercent);
    }
}, 200);
})
document.addEventListener("DOMContentLoaded", function() {
    var upcomingList = document.getElementById("upcoming-events");
    
    upcomingList.classList.add("loading");
    
    onLoadEvents(sampleData);
    
    function onLoadEvents(esportsEvents) {
        upcomingList.classList.remove("loading");
        clearToNoChild(upcomingList);
        addEvents(esportsEvents);
    }
    
    function addEvents(esportsEvents) {
        for(var i = 0; i < esportsEvents.length; i++) addEvent(esportsEvents[i]);
    }
    function addEvent(esportsEvent) {
        var container = document.createElement("li");
        populateEvent(esportsEvent, container);
        upcomingList.appendChild(container);
    }
    function populateEvent(esportsEvent, container) {
        container.appendChild(buildEventPoster(esportsEvent.poster));
        container.appendChild(buildEventStartDate(esportsEvent.schedule));
        container.appendChild(buildEventHeading(esportsEvent.name));
        container.appendChild(buildEventDescription(esportsEvent.description));
        
        container.appendChild(buildEventDetails(esportsEvent));
        
        container.appendChild(buildJoinButton(esportsEvent.availablity));
    }
    
    function buildEventPoster(src) {
        var img = document.createElement("img");
        img.src = src;
        img.alt = "Event Poster";
        return img;
    }
    
    function buildEventHeading(name) {
        var h3 = document.createElement("h3");
        h3.textContent = name;
        return h3;
    }
    
    function buildEventStartDate(schedule) {
        var time = document.createElement("time"),
            startDate = new Date(schedule.start);
            
        time.dateTime = startDate.toISOString();
        time.textContent = "On " + startDate.toDateString();
        time.classList.add("upcoming-events--start-date")
        
        return time;
    }
    
    function buildEventDescription(description) {
        var p = document.createElement("p");
        p.textContent = description.substring(0,100);
        return p;
    }
    
    function buildEventDetails(esportsEvent) {
        var details = document.createElement("ul");
        
        populateDetails(details, esportsEvent.game, "Game");
        populateDetails(details, esportsEvent.provider, "League");
        
        return details;
    }
    
    function populateDetails(details, entity, type) {
        var parent = document.createElement("li"),
            providerType = document.createElement("h4"),
            providerDdLink = document.createElement("a"),
            providerDdImg = document.createElement("img");
            
        providerType.textContent = type || "";
            
        providerDdImg.src = (new URL(entity.icon || "/favicon.ico", entity.website)).toString();
        providerDdImg.alt = `${entity.name} icon`;
        
        providerDdLink.href = entity.website;
        providerDdLink.textContent = entity.name;
        
        parent.appendChild(providerType);
        parent.appendChild(providerDdLink);
        parent.appendChild(providerDdImg);
        details.appendChild(parent);
    }
    
    function buildJoinButton(availablity) {
        var openSpots = countOpenSpots(availablity.teams);
        
        var container = document.createElement("div");
        container.classList.add("buttons");
        
        if(openSpots > 0) {
            var buttonSignUp = document.createElement("button");
            buttonSignUp.textContent = `Sign Up (${openSpots} spots left)`;
            container.appendChild(buttonSignUp);
        }
        
        if(availablity.canFormOwnTeam) {
            var buttonSignUp = document.createElement("button");
            buttonSignUp.textContent = "Form a Team";
            container.appendChild(buttonSignUp);
        }
        
        if(!availablity.canFormOwnTeam && openSpots < 1) {
            var empty = document.createElement("span");
            empty.textContent = "All Spots Full";
            empty.classList.add("empty-state");
            
            container.appendChild(empty);
        }
        
        return container;
    }
    
    function countOpenSpots(teams) {
        var total = 0;
        for(var i = 0; i < teams.length; i++) {
            var spots = teams[i].spots;
            for(var j = 0; j < spots.length; j++) {
                total += spots[j].numFree || 0;
            }
        }
        
        return total;
    }
});


/*
event format: */
var eventTemplate = {
    type: "tournament|",
    name: "string",
    poster: "url",
    id: "string",
    description: "string",
    schedule: {
        start: "datetime",
        startVariance: "string",
        end: "datetime",
        endVariance: "string",
        duration: "int",
        durationUnits: "string"
    },
    format: {
        "type": "bestof|single|exactly",
        "numberOfRounds": "int"
    },
    provider: {
        name: "string",
        website: "url",
        id: "string",
        platform: {
            name: "string",
            website: "url",
            id: "string"
        },
    },
    game: {
        name: "string",
        id: "string",
        website: "url",
        image: "url",
        icon: "url"
    },
    availablity: {
        teams: [
            {
                name: "string",
                spots: [
                    {
                        type: "string",
                        isReserve: "boolean",
                        num: "int",
                        numFree: "int"
                    }
                ]
            }
        ],
        canFormOwnTeam: "boolean"
    }
}


var sampleData = [
    {
        type: "tournament",
        name: "Valorant Tournament",
        poster: "/assets/image/valorant.jpg",
        description: "Single Elimination tournament for High School regional qualifier!",
        schedule: {
            start: "Sat Dec 19 2020 17:03:50 GMT-0500 (Eastern Standard Time)"
        },
        provider: {
            name: "Nerd St. Gamers",
            website: "https://nerdstgamers.com",
            icon: "favicon.ico"
        },
        game: {
            name: "Valorant",
            id: "3555896954",
            website: "https://playvalorant.com",
            image: "/assets/image/valorant.jpg",
            icon: "https://playvalorant.com/static/apple-touch-icon.bf342cdf.png",
        },
        availablity: {
            teams: [
                {
                    name: "NHS Esports",
                    spots: [
                        {
                            type: "N/A",
                            isReserve: false,
                            num: 5,
                            numFree: 4
                        }
                    ]
                }
            ],
            canFormOwnTeam: true
        }
    },
    {
        type: "tournament",
        name: "Valorant Tournament",
        poster: "/assets/image/valorant.jpg",
        description: "Single Elimination tournament for High School regional qualifier!",
        schedule: {
            start: "Sat Dec 19 2020 17:03:50 GMT-0500 (Eastern Standard Time)"
        },
        provider: {
            name: "Nerd St. Gamers",
            website: "https://nerdstgamers.com",
            icon: "favicon.ico"
        },
        game: {
            name: "Valorant",
            id: "3555896954",
            website: "https://playvalorant.com",
            image: "/assets/image/valorant.jpg",
            icon: "https://playvalorant.com/static/apple-touch-icon.bf342cdf.png",
        },
        availablity: {
            teams: [
                {
                    name: "NHS Esports",
                    spots: [
                        {
                            type: "N/A",
                            isReserve: false,
                            num: 5,
                            numFree: 4
                        }
                    ]
                }
            ],
            canFormOwnTeam: false
        }
    },
    {
        type: "tournament",
        name: "Valorant Tournament",
        poster: "/assets/image/valorant.jpg",
        description: "Single Elimination tournament for High School regional qualifier!",
        schedule: {
            start: "Sat Dec 19 2020 17:03:50 GMT-0500 (Eastern Standard Time)"
        },
        provider: {
            name: "Nerd St. Gamers",
            website: "https://nerdstgamers.com",
            icon: "favicon.ico"
        },
        game: {
            name: "Valorant",
            id: "3555896954",
            website: "https://playvalorant.com",
            image: "/assets/image/valorant.jpg",
            icon: "https://playvalorant.com/static/apple-touch-icon.bf342cdf.png",
        },
        availablity: {
            teams: [
                {
                    name: "NHS Esports",
                    spots: [
                        {
                            type: "N/A",
                            isReserve: false,
                            num: 5,
                            numFree: 0
                        }
                    ]
                }
            ],
            canFormOwnTeam: false
        }
    }
]
