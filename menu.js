document.addEventListener('DOMContentLoaded', function() {
    const residentsBtn = document.getElementById('residents');
    const intercomBtn = document.getElementById('intercom');

    residentsBtn.addEventListener('click', function() {
        window.location.href = 'residents.html';
    });

    intercomBtn.addEventListener('click', function() {
        window.location.href = 'intercom.html';
    });
}); 