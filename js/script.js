// Basculer le Mode Sombre
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Mettre à jour le texte et l'icône du bouton
    if (isDarkMode) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Mode Clair';
      localStorage.setItem('theme', 'dark');
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Mode Sombre';
      localStorage.setItem('theme', 'light');
    }
    
    // Mettre à jour le thème du graphique
    if (window.skillsChart) {
      updateChartTheme(window.skillsChart, isDarkMode);
    }
  });
}

// Animation des barres de progression de langues
const animateProgressBars = (immediate = false) => {
  document.querySelectorAll('.languages-list li').forEach(item => {
    const progressBar = item.querySelector('.progress-bar');
    const percentage = item.querySelector('.percentage');
    const targetWidth = item.getAttribute('data-proficiency');
    
    if (progressBar && percentage && targetWidth) {
      // Réinitialiser pour l'animation
      progressBar.style.width = '0';
      percentage.textContent = '0%';
      
      if (immediate) {
        // Animation immédiate pour impression
        progressBar.style.width = `${targetWidth}%`;
        percentage.textContent = `${Math.round(targetWidth)}%`;
        progressBar.style.transition = 'none'; // Désactive la transition pour un changement immédiat
      } else {
        // Animation progressive pour l'affichage normal
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const currentWidth = progress * targetWidth;
          
          progressBar.style.width = `${currentWidth}%`;
          percentage.textContent = `${Math.round(currentWidth)}%`;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
  });
};

// Vérifier la préférence de thème enregistrée
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' && themeToggle) {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Mode Clair';
  }
  
  // Initialiser les animations AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }
  
  // Déclencher l'animation des barres de progression quand visible
  const languagesList = document.querySelector('.languages-list');
  if (languagesList && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateProgressBars();
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(languagesList);
  } else if (languagesList) {
    // Fallback si IntersectionObserver n'est pas disponible
    animateProgressBars();
  }
  
  // Graphique des compétences avec Chart.js
  const ctx = document.getElementById('skillsChart').getContext('2d');
  if (ctx && typeof Chart !== 'undefined') {
    try {
      const skillsChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Python', 'Java', 'HTML/CSS', 'PHP', 'MySQL', 'React', 'Réseaux'],
          datasets: [{
            label: 'Niveau de Compétence',
            data: [85, 70, 80, 75, 70, 70, 80],
            backgroundColor: 'rgba(61, 50, 218, 0.2)',
            borderColor: 'rgba(61, 50, 218, 1)',
            pointBackgroundColor: 'rgba(61, 50, 218, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(61, 50, 218, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              pointLabels: {
                font: {
                  size: 14
                }
              },
              suggestedMin: 0,
              suggestedMax: 100
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      
      // Stocker l'instance du graphique pour y accéder plus tard
      window.skillsChart = skillsChart;
      
      // Appliquer le thème sombre au graphique si nécessaire
      if (document.body.classList.contains('dark-mode')) {
        updateChartTheme(skillsChart, true);
      }
    } catch (e) {
      console.error("Erreur lors de l'initialisation du graphique:", e);
    }
  }
  
  // Fonctionnalité d'impression CV
  const printButton = document.getElementById('print-cv');
  if (printButton) {
    printButton.addEventListener('click', () => {
      // Afficher un message de préparation
      const printPreparationMessage = document.createElement('div');
      printPreparationMessage.style.position = 'fixed';
      printPreparationMessage.style.top = '50%';
      printPreparationMessage.style.left = '50%';
      printPreparationMessage.style.transform = 'translate(-50%, -50%)';
      printPreparationMessage.style.background = 'rgba(0, 0, 0, 0.8)';
      printPreparationMessage.style.color = 'white';
      printPreparationMessage.style.padding = '20px';
      printPreparationMessage.style.borderRadius = '5px';
      printPreparationMessage.style.zIndex = '9999';
      printPreparationMessage.innerHTML = 'Préparation du CV pour impression...';
      document.body.appendChild(printPreparationMessage);
      
      // Sauvegarder l'état actuel du thème
      const wasDarkMode = document.body.classList.contains('dark-mode');
      
      // Forcer toutes les animations AOS à se terminer
      if (typeof AOS !== 'undefined') {
        document.querySelectorAll('[data-aos]').forEach(el => {
          el.classList.add('aos-animate');
          // Supprime les transformations pour s'assurer que tout est visible
          el.style.transform = 'none';
          el.style.opacity = '1';
          
        });
      }

      // Forcer les barres de progression à se compléter immédiatement
      animateProgressBars(true);
      
      
      // Toujours passer en mode clair pour l'impression
      if (wasDarkMode) {
        document.body.classList.remove('dark-mode');
        // Mettre à jour le graphique si nécessaire
        if (window.skillsChart) {
          updateChartTheme(window.skillsChart, false);
        }
      }
      
      // Attendre un court instant pour s'assurer que tout est prêt
      setTimeout(() => {
        // Supprimer le message de préparation
        document.body.removeChild(printPreparationMessage);
        
        // Imprimer
        window.print();
        
        // Restaurer le mode sombre s'il était actif avant
        if (wasDarkMode) {
          setTimeout(() => {
            document.body.classList.add('dark-mode');
            // Mettre à jour le graphique
            if (window.skillsChart) {
              updateChartTheme(window.skillsChart, true);
            }
            // Mettre à jour le texte du bouton
            if (themeToggle) {
              themeToggle.innerHTML = '<i class="fas fa-sun"></i> Mode Clair';
            }
            
            // Restaurer les transitions pour les barres de progression
            document.querySelectorAll('.progress-bar').forEach(bar => {
              bar.style.transition = '';
            });
          }, 100);
        }
      }, 1500); // Délai pour s'assurer que toutes les animations sont terminées surtout pour les progressbar
    });
  }
  
  // Effet de survol des cartes de projet
  const projects = document.querySelectorAll('.project');
  if (projects.length > 0) {
    projects.forEach(project => {
      project.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
      });
      
      project.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
      });
    });
  }
  
  // Effet de l'image de profil
  const profileImg = document.getElementById('profile-img');
  if (profileImg) {
    profileImg.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    });
    
    profileImg.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
  }
});

// Fonction pour mettre à jour le thème du graphique (dark and light mode)
function updateChartTheme(chart, isDark) {
  try {
    const textColor = isDark ? '#FFFFFF' : '#333'; // or '#f0e68c' for lighter gold
    const gridColor = isDark ? 'rgba(255, 215, 0, 0.5)' : 'rgba(61, 50, 218, 0.2)';

    chart.options.scales.r.grid.color = gridColor;
    chart.options.scales.r.angleLines.color = gridColor;
    chart.options.scales.r.pointLabels.color = textColor;

    if (isDark) {
      chart.data.datasets[0].backgroundColor = 'rgba(218, 165, 32, 0.2)';
      chart.data.datasets[0].borderColor = 'rgba(218, 165, 32, 1)';
      chart.data.datasets[0].pointBackgroundColor = 'rgba(218, 165, 32, 1)';
      chart.data.datasets[0].pointHoverBorderColor = 'rgba(218, 165, 32, 1)';
    } else {
      chart.data.datasets[0].backgroundColor = 'rgba(61, 50, 218, 0.2)';
      chart.data.datasets[0].borderColor = 'rgba(61, 50, 218, 1)';
      chart.data.datasets[0].pointBackgroundColor = 'rgba(61, 50, 218, 1)';
      chart.data.datasets[0].pointHoverBorderColor = 'rgba(61, 50, 218, 1)';
    }

    chart.update();
  } catch (e) {
    console.error("Erreur lors de la mise à jour du thème du graphique:", e);
  }
}
