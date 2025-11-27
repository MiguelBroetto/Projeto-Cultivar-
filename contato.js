 (function () {
      emailjs.init("2oEXG1umxPx3N_u33"); // sua public key do EmailJS
    })();

    const form = document.getElementById('contactForm');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
      }

      // Envia o formulário via EmailJS
      emailjs.sendForm('service_vn8hv0g', 'template_6hlurdd', this)
        .then(() => {
          alert('Mensagem enviada com sucesso! Obrigado pelo contato.');
          form.reset();
          window.location.href = "index.html"; // redirecionar após envio
        })
        .catch((error) => {
          console.error('Erro:', error);
          alert('Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.');
        });
    });

    // icone de configuração 

    const settingsBtn = document.getElementById('settingsBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');


    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('active');
    });


    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== settingsBtn) {
        dropdownMenu.classList.remove('active');
      }
    });