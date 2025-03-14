document.addEventListener('DOMContentLoaded', function() {
    // Add this debug code at the start
    console.log('DOM Content Loaded');
   
    const watchDemoBtn = document.querySelector('.hero-buttons .btn-secondary');
    console.log('Watch Demo Button:', watchDemoBtn); // Check if button is found
   
    const modal = document.getElementById('demoModal');
    console.log('Modal:', modal); // Check if modal is found
   
    const closeBtn = document.querySelector('.close-modal');
    console.log('Close Button:', closeBtn); // Check if close button is found
   
    const videoPlayer = document.getElementById('demoVideo');
    console.log('Video Player:', videoPlayer); // Check if video player is found


    // Initialize VANTA background
    VANTA.WAVES({
        el: "#vanta-background",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x0077ff,
        shininess: 27.00,
        waveHeight: 20.00,
        waveSpeed: 0.75,
        zoom: 0.65
    });




    const chatBotIcon = document.getElementById('chatBotIcon');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
   
    // Initialize chat bot
    const chat = new HuggingFaceChat('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');
   
    // Toggle chat container
    chatBotIcon.addEventListener('click', () => {
        chatContainer.classList.add('active');
    });
   
    closeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });
   
    // Close chat if clicked outside
    document.addEventListener('click', (e) => {
        if (!chatContainer.contains(e.target) &&
            !chatBotIcon.contains(e.target) &&
            chatContainer.classList.contains('active')) {
            chatContainer.classList.remove('active');
        }
    });




    // Initialize the hero slider
    const heroSlider = new HeroSlider();




    // Initialize the feature slider
    const featureSlider = new FeatureSlider();




    // Initialize hero tabs
    const heroTabs = new HeroTabs();


    // Make sure the button exists before adding event listener
    if (watchDemoBtn) {
        console.log('Adding click event listener to Watch Demo button');
        watchDemoBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Watch Demo clicked');
            modal.style.display = "block";
            videoPlayer.play().catch(function(error) {
                console.log("Video play failed:", error);
            });
            document.body.style.overflow = 'hidden';
        };
    } else {
        console.error('Watch Demo button not found');
    }


    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            document.body.style.overflow = 'auto';
        });
    }


    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            document.body.style.overflow = 'auto';
        }
    });


    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            document.body.style.overflow = 'auto';
        }
    });
});




class HuggingFaceChat {
    // ... (paste the entire HuggingFaceChat class from dashboard.js)
}




class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.tab-dot');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }




    init() {
        // Set up click events for dots
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                this.goToSlide(index);
                this.resetInterval();
            });
        });




        // Start automatic sliding
        this.startInterval();




        // Pause on hover
        const heroContainer = document.querySelector('.hero-container');
        heroContainer.addEventListener('mouseenter', () => this.stopInterval());
        heroContainer.addEventListener('mouseleave', () => this.startInterval());
    }




    goToSlide(index) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');




        // Add previous class to current slide
        this.slides[this.currentSlide].classList.add('previous');




        // Update current slide
        this.currentSlide = index;




        // Remove previous class and add active class to new slide
        this.slides.forEach(slide => slide.classList.remove('previous'));
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }




    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    }




    startInterval() {
        this.slideInterval = setInterval(() => this.nextSlide(), 5000); // Change slide every 5 seconds
    }




    stopInterval() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }




    resetInterval() {
        this.stopInterval();
        this.startInterval();
    }
}




class FeatureSlider {
    constructor() {
        this.slides = document.querySelectorAll('.feature-slide');
        this.dots = document.querySelectorAll('.feature-dot');
        this.prevBtn = document.getElementById('prevFeature');
        this.nextBtn = document.getElementById('nextFeature');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }




    init() {
        // Set up button events
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.resetInterval();
        });
       
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.resetInterval();
        });




        // Set up dot events
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                this.goToSlide(index);
                this.resetInterval();
            });
        });




        // Start automatic sliding
        this.startInterval();




        // Pause on hover
        const slider = document.querySelector('.features-slider');
        slider.addEventListener('mouseenter', () => this.stopInterval());
        slider.addEventListener('mouseleave', () => this.startInterval());
    }




    goToSlide(index) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');




        // Add previous class to current slide
        this.slides[this.currentSlide].classList.add('previous');




        // Update current slide
        this.currentSlide = index;




        // Remove previous class and add active class to new slide
        this.slides.forEach(slide => slide.classList.remove('previous'));
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }




    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    }




    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prev);
    }




    startInterval() {
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }




    stopInterval() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }




    resetInterval() {
        this.stopInterval();
        this.startInterval();
    }
}




class HeroTabs {
    constructor() {
        this.slides = document.querySelectorAll('.tab-slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }




    init() {
        this.startSlideShow();
    }




    showSlide(index) {
        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
       
        // Update current slide
        this.currentSlide = index;
       
        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');
    }




    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
    }




    startSlideShow() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
}





