function showDetails(event){
    const lesson = event.currentTarget;
    const classes = document.querySelectorAll('.show');
    console.log(classes.length)
    
    for (var i = 0; i < classes.length; i++) {
        if (lesson === classes[i]) {
            var className = ".class-" + (i + 1);
            const current = document.querySelector(className);
            current.classList.remove('hidden');
        }
    }
}

function hideDetails(event){        
    const classes = document.querySelectorAll('.detail');
    console.log(classes.length)
    
    for (var i = 0; i < classes.length; i++) {
        classes[i].classList.add('hidden');
    }
}

const lessons = document.querySelectorAll('.show');

for (var i = 0; i < lessons.length; i++) {
    lessons[i].addEventListener("mouseenter", showDetails);
    lessons[i].addEventListener("mouseleave", hideDetails);
}
