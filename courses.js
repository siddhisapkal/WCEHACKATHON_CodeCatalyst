document.addEventListener('DOMContentLoaded', function() {
    // Get all selector elements
    const eduButtons = document.querySelectorAll('.edu-btn');
    const schoolGrades = document.getElementById('school-grades');
    const collegeStreams = document.getElementById('college-streams');
    const gradeButtons = document.querySelectorAll('.grade-btn');
    const streamButtons = document.querySelectorAll('.stream-btn');
    const courseSections = document.querySelectorAll('.course-section');

    // Education level selection
    eduButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            eduButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show/hide appropriate selector
            if (this.dataset.level === 'school') {
                schoolGrades.classList.remove('hidden');
                collegeStreams.classList.add('hidden');
            } else {
                schoolGrades.classList.add('hidden');
                collegeStreams.classList.remove('hidden');
            }

            // Hide all course sections
            hideAllCourseSections();
        });
    });

    // Grade selection
    gradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            gradeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding courses
            hideAllCourseSections();
            const gradeSection = document.getElementById(`grade-${this.dataset.grade}`);
            if (gradeSection) {
                gradeSection.classList.remove('hidden');
            }
        });
    });

    // Stream selection
    streamButtons.forEach(button => {
        button.addEventListener('click', function() {
            streamButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding courses
            hideAllCourseSections();
            const streamSection = document.getElementById(`${this.dataset.stream}-courses`);
            if (streamSection) {
                streamSection.classList.remove('hidden');
            }
        });
    });

    function hideAllCourseSections() {
        courseSections.forEach(section => {
            section.classList.add('hidden');
        });
    }

    // Voice assistance functionality
    const voiceAssistBtn = document.getElementById('voiceAssistBtn');
    let voiceAssistanceEnabled = false;

    if (voiceAssistBtn) {
        voiceAssistBtn.addEventListener('click', function() {
            voiceAssistanceEnabled = !voiceAssistanceEnabled;
            if (voiceAssistanceEnabled) {
                speakText("Voice assistance enabled. Please select your education level and browse courses.");
            } else {
                speakText("Voice assistance disabled");
            }
        });
    }

    // Add hover effect for course cards with voice assistance
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('mouseover', function() {
            if (voiceAssistanceEnabled) {
                const title = this.querySelector('h3').textContent;
                const description = this.querySelector('p').textContent;
                speakText(`${title}. ${description}`);
            }
        });
    });
});

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
} 