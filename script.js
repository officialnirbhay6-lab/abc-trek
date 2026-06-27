// Global Booking State
let bookingState = {
    packageType: 'standard',
    packagePrice: 20000,
    startDate: '',
    trekkersCount: 1,
    hasPorter: false,
    hasGear: false,
    basePrice: 20000,
    groupDiscount: 0,
    addonsTotal: 0,
    totalPrice: 20000,
    contactName: '',
    contactEmail: '',
    contactWhatsapp: '',
    specialRequests: ''
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    // 0. Force Autoplay for Videos (esp. on Mobile browsers)
    const forceAutoplayVideos = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.muted = true;
            video.playsInline = true;
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Fail silently, retry on interaction
                });
            }
        });
    };

    // Run immediately
    forceAutoplayVideos();

    // Trigger play on first gesture (scrolling, clicking, touching) to unlock media engine
    const gestureEvents = ['touchstart', 'scroll', 'click', 'keydown'];
    const handleFirstGesture = () => {
        forceAutoplayVideos();
        gestureEvents.forEach(eventType => {
            document.removeEventListener(eventType, handleFirstGesture);
        });
    };
    gestureEvents.forEach(eventType => {
        document.addEventListener(eventType, handleFirstGesture, { passive: true });
    });

    // 1. Initialize Date Input - Set Minimum Date to Tomorrow
    const dateInput = document.getElementById('trek-date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
            
            // Toggle hamburger animation
            const bars = menuToggle.querySelectorAll('.bar');
            if (menuToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close mobile menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
                menuToggle.querySelectorAll('.bar')[1].style.opacity = '1';
            });
        });
    }

    // 3. Header Scroll Effect
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    });

    // 4. Initial pricing run
    updatePricing();
});

// Itinerary Timeline Accordion Logic
function toggleTimeline(dayNumber) {
    const targetItem = document.getElementById(`day-${dayNumber}-item`);
    if (!targetItem) return;

    const isActive = targetItem.classList.contains('active');

    // Collapse all items first
    for (let i = 1; i <= 5; i++) {
        const item = document.getElementById(`day-${i}-item`);
        if (item) {
            item.classList.remove('active');
            const body = item.querySelector('.timeline-body');
            if (body) body.style.maxHeight = null;
        }
    }

    // If target was not active, expand it
    if (!isActive) {
        targetItem.classList.add('active');
        const body = targetItem.querySelector('.timeline-body');
        if (body) {
            body.style.maxHeight = body.scrollHeight + "px";
        }
    }
}

// Booking Portal Package Selection
function selectPackage(type, price) {
    bookingState.packageType = type;
    bookingState.packagePrice = price;

    // Toggle active state classes in UI
    const stdCard = document.getElementById('pack-std');
    const dlxCard = document.getElementById('pack-dlx');

    if (type === 'standard') {
        stdCard.classList.add('selected');
        dlxCard.classList.remove('selected');
    } else {
        dlxCard.classList.add('selected');
        stdCard.classList.remove('selected');
    }

    updatePricing();
}

// Live Pricing Calculations
function updatePricing() {
    // Read count input
    const countInput = document.getElementById('trekker-count');
    bookingState.trekkersCount = parseInt(countInput.value) || 1;
    if (bookingState.trekkersCount < 1) {
        bookingState.trekkersCount = 1;
        countInput.value = 1;
    }

    // Check addons
    const porterCheckbox = document.getElementById('addon-porter');
    const gearCheckbox = document.getElementById('addon-gear');
    bookingState.hasPorter = porterCheckbox ? porterCheckbox.checked : false;
    bookingState.hasGear = gearCheckbox ? gearCheckbox.checked : false;

    // 1. Calculate Base Price
    bookingState.basePrice = bookingState.packagePrice * bookingState.trekkersCount;

    // 2. Group discount (10% discount on base price if trekkers count is 4 or more)
    const discountHint = document.getElementById('group-discount-hint');
    const discountRow = document.getElementById('row-group-discount');
    
    if (bookingState.trekkersCount >= 4) {
        bookingState.groupDiscount = Math.round(bookingState.basePrice * 0.1);
        if (discountHint) discountHint.innerHTML = `<span style="color:#10b981">10% Group discount applied!</span>`;
        if (discountRow) discountRow.classList.remove('hidden');
    } else {
        bookingState.groupDiscount = 0;
        if (discountHint) discountHint.innerText = '10% discount for groups of 4+';
        if (discountRow) discountRow.classList.add('hidden');
    }

    // 3. Calculate Addons
    // Porter is flat Rs. 5000 total, Gear rental is Rs. 3000 per person
    let addons = 0;
    if (bookingState.hasPorter) addons += 5000;
    if (bookingState.hasGear) addons += (3000 * bookingState.trekkersCount);
    bookingState.addonsTotal = addons;

    const addonsRow = document.getElementById('row-addons');
    if (addons > 0) {
        if (addonsRow) addonsRow.classList.remove('hidden');
    } else {
        if (addonsRow) addonsRow.classList.add('hidden');
    }

    // 4. Calculate Final Total
    bookingState.totalPrice = (bookingState.basePrice - bookingState.groupDiscount) + bookingState.addonsTotal;

    // 5. Update UI Labels
    document.getElementById('summary-trekkers-count').innerText = bookingState.trekkersCount;
    document.getElementById('summary-pack-price').innerText = `Rs. ${bookingState.packagePrice.toLocaleString('en-IN')}`;
    document.getElementById('val-base-price').innerText = `Rs. ${bookingState.basePrice.toLocaleString('en-IN')}`;
    document.getElementById('val-group-discount').innerText = `-Rs. ${bookingState.groupDiscount.toLocaleString('en-IN')}`;
    document.getElementById('val-addons').innerText = `+Rs. ${bookingState.addonsTotal.toLocaleString('en-IN')}`;
    document.getElementById('val-total-price').innerText = `Rs. ${bookingState.totalPrice.toLocaleString('en-IN')}`;
}

// Multi-step Booking Form Transitions & Validation
function goToStep(stepNum) {
    // Validate inputs of previous steps
    if (stepNum === 2) {
        // Validation for Step 1
        const dateInput = document.getElementById('trek-date');
        if (!dateInput || !dateInput.value) {
            alert('Please select a trek start date.');
            dateInput.focus();
            return;
        }
        bookingState.startDate = dateInput.value;
    }

    if (stepNum === 3) {
        // Validation for Step 2
        const nameVal = document.getElementById('contact-name').value.trim();
        const emailVal = document.getElementById('contact-email').value.trim();
        const phoneVal = document.getElementById('contact-whatsapp').value.trim();

        if (!nameVal) {
            alert('Please enter your full name.');
            document.getElementById('contact-name').focus();
            return;
        }
        if (!emailVal || !validateEmail(emailVal)) {
            alert('Please enter a valid email address.');
            document.getElementById('contact-email').focus();
            return;
        }
        if (!phoneVal) {
            alert('Please enter your WhatsApp phone number.');
            document.getElementById('contact-whatsapp').focus();
            return;
        }

        bookingState.contactName = nameVal;
        bookingState.contactEmail = emailVal;
        bookingState.contactWhatsapp = phoneVal;
        bookingState.specialRequests = document.getElementById('special-requests').value.trim();

        // Populate Step 3 Review UI
        document.getElementById('rev-package').innerText = bookingState.packageType.charAt(0).toUpperCase() + bookingState.packageType.slice(1) + ' Package';
        document.getElementById('rev-date').innerText = formatDate(bookingState.startDate);
        document.getElementById('rev-trekkers').innerText = `${bookingState.trekkersCount} Trekker${bookingState.trekkersCount > 1 ? 's' : ''}`;
        
        // Formulate Addons list
        let addonsTextList = [];
        if (bookingState.hasPorter) addonsTextList.push('Porter Service');
        if (bookingState.hasGear) addonsTextList.push('Gear Rental');
        document.getElementById('rev-addons').innerText = addonsTextList.length > 0 ? addonsTextList.join(', ') : 'None';
        
        document.getElementById('rev-name').innerText = bookingState.contactName;
        document.getElementById('rev-email').innerText = bookingState.contactEmail;
        document.getElementById('rev-phone').innerText = bookingState.contactWhatsapp;
        document.getElementById('rev-total-price').innerText = `Rs. ${bookingState.totalPrice.toLocaleString('en-IN')}`;
    }

    // Process UI Transition
    // 1. Toggle Step Content Divs
    document.querySelectorAll('.booking-step').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`step-${stepNum}-content`).classList.add('active');

    // 2. Update Progress Bar
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        const stepIndex = index + 1;
        el.classList.remove('active', 'completed');
        if (stepIndex < stepNum) {
            el.classList.add('completed');
        } else if (stepIndex === stepNum) {
            el.classList.add('active');
        }
    });

    document.querySelectorAll('.progress-line').forEach((el, index) => {
        const lineIndex = index + 1;
        el.classList.remove('completed');
        if (lineIndex < stepNum) {
            el.classList.add('completed');
        }
    });
}

// Booking Final Submission
function submitBooking(mode) {
    if (mode === 'whatsapp') {
        // Compile WhatsApp text template
        const porterStatus = bookingState.hasPorter ? 'Yes' : 'No';
        const gearStatus = bookingState.hasGear ? 'Yes' : 'No';
        const requests = bookingState.specialRequests ? bookingState.specialRequests : 'None';

        const message = 
`Namaste Hikers in Nepal! 🗻
I would like to book a 5-Day Annapurna Base Camp Trek booking.

Trek Details:
----------------------------------
Package: ${bookingState.packageType.toUpperCase()} Package
Start Date: ${formatDate(bookingState.startDate)}
Trekkers: ${bookingState.trekkersCount}
Porter Addon: ${porterStatus}
Gear Rental Addon: ${gearStatus}

Primary Contact Details:
----------------------------------
Name: ${bookingState.contactName}
Email: ${bookingState.contactEmail}
WhatsApp: ${bookingState.contactWhatsapp}
Special requests: ${requests}

----------------------------------
Total Package Cost: Rs. ${bookingState.totalPrice.toLocaleString('en-IN')} INR
----------------------------------
Please confirm the guide permit availability for our selected dates. Thank you!`;

        const encodedText = encodeURIComponent(message);
        // Company WhatsApp number link integration (9779856012345)
        const waLink = `https://wa.me/9779856012345?text=${encodedText}`;
        window.open(waLink, '_blank');
    } else {
        // Mode 'portal' -> Direct simulated form submission success state
        
        // Generate random ticket booking code
        const randCode = 'ABC-' + Math.floor(10000 + Math.random() * 90000);
        
        // Set values in success screen
        document.getElementById('success-booking-code').innerText = randCode;
        document.getElementById('success-start-date').innerText = formatDate(bookingState.startDate);
        document.getElementById('success-total-price').innerText = `Rs. ${bookingState.totalPrice.toLocaleString('en-IN')}`;

        // Switch to success step content
        document.querySelectorAll('.booking-step').forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById('step-success-content').classList.add('active');

        // Complete progress bar
        document.querySelectorAll('.progress-step').forEach(el => {
            el.classList.remove('active');
            el.classList.add('completed');
        });
        document.querySelectorAll('.progress-line').forEach(el => {
            el.classList.add('completed');
        });
    }
}

// Reset booking form back to starting state
function resetBookingPortal() {
    // Reset form elements
    document.getElementById('trek-date').value = '';
    document.getElementById('trekker-count').value = 1;
    if (document.getElementById('addon-porter')) document.getElementById('addon-porter').checked = false;
    if (document.getElementById('addon-gear')) document.getElementById('addon-gear').checked = false;
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-whatsapp').value = '';
    document.getElementById('special-requests').value = '';

    // Reset State
    bookingState = {
        packageType: 'standard',
        packagePrice: 20000,
        startDate: '',
        trekkersCount: 1,
        hasPorter: false,
        hasGear: false,
        basePrice: 20000,
        groupDiscount: 0,
        addonsTotal: 0,
        totalPrice: 20000,
        contactName: '',
        contactEmail: '',
        contactWhatsapp: '',
        specialRequests: ''
    };

    selectPackage('standard', 20000);
    goToStep(1);
}

// Utility Validation Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
}
