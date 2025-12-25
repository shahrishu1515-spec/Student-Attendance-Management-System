// main.js
document.addEventListener('DOMContentLoaded', function() {
    // LOGIN PAGE
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const loginAlert = document.getElementById('login-alert');
        
        // Clear previous session
        localStorage.removeItem('attendanceLoggedIn');
        localStorage.removeItem('attendanceUsername');
        
        // Login form handler
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Check credentials
            if (username === 'SOSIT5' && password === 'BSCIT5') {
                localStorage.setItem('attendanceLoggedIn', 'true');
                localStorage.setItem('attendanceUsername', username);
                
                loginAlert.style.display = 'none';
                
                // Show loading
                const submitBtn = loginForm.querySelector('.login-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    window.location.href = "subject.html";
                }, 1500);
                
            } else {
                loginAlert.style.display = 'flex';
                
                // Shake animation for error
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
                
                document.getElementById('password').value = '';
                
                setTimeout(() => {
                    loginAlert.style.display = 'none';
                }, 4000);
            }
        });
        
        // Shake animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .shake {
                animation: shake 0.5s ease-in-out;
            }
        `;
        document.head.appendChild(style);
        
        document.getElementById('username').focus();
    }
    
    // SUBJECT SELECTION PAGE
    if (document.getElementById('semester3-subjects')) {
        // Check login status
        const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
        const username = localStorage.getItem('attendanceUsername');
        
        if (isLoggedIn !== 'true' || !username) {
            window.location.href = "index.html";
            return;
        }
        
        // Subject data
        const subjects = {
            semester3: [
                { code: "CLSC2140", name: "MINDFULNESS AND WELL-BEING", semester: 3 },
                { code: "SSCA3021", name: "Data Science", semester: 3 },
                { code: "SSCS3010", name: "Software Engineering", semester: 3 },
                { code: "SSCS3021", name: "Blockchain Technology", semester: 3 }
            ],
            semester5: [
                { code: "SSCS3910", name: "Project/Summer Internship (2023)", semester: 5 },
                { code: "TMPC3010", name: "Corporate Grooming & Etiquette", semester: 5 },
                { code: "CLSC2030", name: "IPDC-II", semester: 5 },
                { code: "SSC42050", name: "Mobile Application Development", semester: 5 },
                { code: "SSC52041", name: "Operating Systems", semester: 5 },
                { code: "SSC52051", name: "Programming with Python", semester: 5 },
                { code: "SSC52061", name: "Cryptography & Network Security", semester: 5 },
                { code: "SSC52510", name: "Programming with .NET", semester: 5 }
            ]
        };

        // Time slots
        const timeSlots = [
            { start: "09:15", end: "10:15", lecture: "Lecture 1", duration: "60 mins" },
            { start: "10:15", end: "11:15", lecture: "Lecture 2", duration: "60 mins" },
            { start: "11:15", end: "11:45", lecture: "Break", duration: "30 mins", isBreak: true },
            { start: "11:45", end: "12:45", lecture: "Lecture 3", duration: "60 mins" },
            { start: "12:45", end: "13:45", lecture: "Lecture 4", duration: "60 mins" },
            { start: "13:45", end: "14:00", lecture: "Short Break", duration: "15 mins", isBreak: true },
            { start: "14:00", end: "15:00", lecture: "Lecture 5", duration: "60 mins" },
            { start: "15:00", end: "16:15", lecture: "Tutorial/Lab", duration: "75 mins" }
        ];

        let selectedSubject = null;
        let selectedTimeSlot = null;

        // DOM Elements
        const semester3Container = document.getElementById('semester3-subjects');
        const semester5Container = document.getElementById('semester5-subjects');
        const timeSlotsContainer = document.getElementById('time-slots');
        const selectedInfoPanel = document.getElementById('selected-info');
        const takeAttendanceBtn = document.getElementById('take-attendance-btn');
        const backBtn = document.getElementById('back-btn');
        const alertDiv = document.getElementById('selection-alert');

        // Render subjects
        subjects.semester3.forEach(subject => {
            const subjectCard = createSubjectCard(subject);
            semester3Container.appendChild(subjectCard);
        });

        subjects.semester5.forEach(subject => {
            const subjectCard = createSubjectCard(subject);
            semester5Container.appendChild(subjectCard);
        });

        // Render time slots
        timeSlots.forEach((slot, index) => {
            const timeSlotElement = createTimeSlotElement(slot, index);
            timeSlotsContainer.appendChild(timeSlotElement);
        });

        // Helper functions
        function createSubjectCard(subject) {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.dataset.code = subject.code;
            card.dataset.name = subject.name;
            card.dataset.semester = subject.semester;
            
            card.innerHTML = `
                <div class="select-indicator"></div>
                <div class="subject-code">${subject.code}</div>
                <div class="subject-name">${subject.name}</div>
                <div class="subject-info">
                    <span>Semester ${subject.semester}</span>
                    <span>Click to select</span>
                </div>
            `;
            
            card.addEventListener('click', () => selectSubject(subject, card));
            return card;
        }

        function createTimeSlotElement(slot, index) {
            const timeSlot = document.createElement('div');
            timeSlot.className = `time-slot ${slot.isBreak ? 'break-time' : ''}`;
            timeSlot.dataset.index = index;
            timeSlot.dataset.start = slot.start;
            timeSlot.dataset.end = slot.end;
            timeSlot.dataset.lecture = slot.lecture;
            timeSlot.dataset.duration = slot.duration;
            
            timeSlot.innerHTML = `
                <div class="time-range">${formatTime(slot.start)} - ${formatTime(slot.end)}</div>
                <div class="lecture-number">${slot.lecture}</div>
                <div class="duration">${slot.duration}</div>
            `;
            
            if (!slot.isBreak) {
                timeSlot.addEventListener('click', () => selectTimeSlot(slot, timeSlot));
            }
            
            return timeSlot;
        }

        function formatTime(timeStr) {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
        }

        function selectSubject(subject, cardElement) {
            document.querySelectorAll('.subject-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            cardElement.classList.add('selected');
            selectedSubject = subject;
            updateSelectedInfo();
            updateTakeAttendanceButton();
        }

        function selectTimeSlot(slot, slotElement) {
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('selected');
            });
            
            slotElement.classList.add('selected');
            selectedTimeSlot = slot;
            updateSelectedInfo();
            updateTakeAttendanceButton();
        }

        function updateSelectedInfo() {
            if (selectedSubject || selectedTimeSlot) {
                selectedInfoPanel.style.display = 'block';
                
                if (selectedSubject) {
                    document.getElementById('selected-subject-name').textContent = selectedSubject.name;
                    document.getElementById('selected-subject-code').textContent = selectedSubject.code;
                }
                
                if (selectedTimeSlot) {
                    document.getElementById('selected-time-slot').textContent = 
                        `${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}`;
                    document.getElementById('selected-lecture-number').textContent = selectedTimeSlot.lecture;
                }
            } else {
                selectedInfoPanel.style.display = 'none';
            }
        }

        function updateTakeAttendanceButton() {
            if (selectedSubject && selectedTimeSlot && !selectedTimeSlot.isBreak) {
                takeAttendanceBtn.disabled = false;
                hideAlert();
            } else {
                takeAttendanceBtn.disabled = true;
            }
        }

        function showAlert(message) {
            alertDiv.querySelector('span').textContent = message;
            alertDiv.style.display = 'flex';
        }

        function hideAlert() {
            alertDiv.style.display = 'none';
        }

        // Event listeners
        takeAttendanceBtn.addEventListener('click', function() {
            if (!selectedSubject || !selectedTimeSlot) {
                showAlert('Please select both a subject and a time slot to continue');
                return;
            }
            
            if (selectedTimeSlot.isBreak) {
                showAlert('Cannot take attendance during break time. Please select a lecture time slot.');
                return;
            }
            
            // Store data for attendance page
            localStorage.setItem('attendanceSubject', JSON.stringify(selectedSubject));
            localStorage.setItem('attendanceTimeSlot', JSON.stringify(selectedTimeSlot));
            localStorage.setItem('attendanceDate', new Date().toISOString());
            
            const originalText = takeAttendanceBtn.innerHTML;
            takeAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
            takeAttendanceBtn.disabled = true;
            
            setTimeout(() => {
                window.location.href = "student.html";
            }, 1500);
        });

        backBtn.addEventListener('click', function() {
            localStorage.removeItem('attendanceLoggedIn');
            localStorage.removeItem('attendanceUsername');
            localStorage.removeItem('attendanceSubject');
            localStorage.removeItem('attendanceTimeSlot');
            window.location.href = "index.html";
        });

        // Auto-select first items for demo
        setTimeout(() => {
            const firstSubject = document.querySelector('.subject-card');
            const firstTimeSlot = document.querySelector('.time-slot:not(.break-time)');
            
            if (firstSubject && firstTimeSlot) {
                firstSubject.click();
                firstTimeSlot.click();
            }
        }, 500);
    }
});