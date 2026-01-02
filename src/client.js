document.addEventListener('DOMContentLoaded', () => {
  const wsHost = window.location.host;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${wsProtocol}//${wsHost}`);

  let slides = Array.from(document.querySelectorAll('section[id]'));
  const commandPrompt = document.getElementById('command-prompt');
  const helpBox = document.getElementById('help-box');

  let lastKey = '';
  let command = '';
  let commandMode = false;

  function goToSlide(slideNumber) {
    if (isNaN(slideNumber)) {
      console.error('Invalid slide number: ' + slideNumber);
      return false;
    }

    if (slideNumber <= 0) {
      console.error('Slide number must be greater than 0: ' + slideNumber);
      return false;
    }

    if (slideNumber > slides.length) {
      console.error('Slide number exceeds total slides: ' + slideNumber);
      return false;
    }

    console.info('Navigating to slide: ' + slideNumber);

    slides[slideNumber - 1].scrollIntoView({ behavior: 'smooth' });
    return true;
  }

  function findSlideByString(string) {
    const lowerString = string.toLowerCase();
    let found = false;
    for (let i = 0; i < slides.length && !found; i++) {
      if (slides[i].textContent.toLowerCase().includes(lowerString)) {
        slides[i].scrollIntoView({ behavior: 'smooth' });
        found = true;
      }
    }
    if (!found) {
      console.error('No slide contains the string: ' + string);
      return false;
    }

    return true;
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        // TODO: support force rebuild
        // if(data.rebuild == true) {
        //   window.location.reload();
        //   return;
        // }
        const marpContainer = document.getElementById('marp-container');
        if (marpContainer) {
          morphdom(marpContainer, `<div id="marp-container">${data.html}</div>`);
        }
        if (document.getElementById('marp-style').innerHTML !== data.css) {
          document.getElementById('marp-style').innerHTML = data.css;
        }
        slides = Array.from(document.querySelectorAll('section[id]'));
      } else if (data.command === 'goto' && data.slide) {
        goToSlide(parseInt(data.slide, 10));
      } else if (data.command === 'find' && data.string) {
        findSlideByString(data.string);
      } else if (data.command === 'close_preview') {
        window.close();
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };

  function updatePrompt(text, isError = false) {
    if (commandMode) {
      commandPrompt.style.display = 'block';
      commandPrompt.textContent = text;
      commandPrompt.style.color = isError ? 'red' : 'white';
    } else {
      commandPrompt.style.display = 'none';
      commandPrompt.style.color = 'white'; // Reset color when hidden
    }
  }

  document.addEventListener('keydown', (e) => {
    if (commandMode) {
      if (e.key === 'Enter') {
        const slideNumber = parseInt(command, 10);
        if (goToSlide(slideNumber)) {
          commandMode = false;
          command = '';
          updatePrompt(':' + command);
        } else {
          updatePrompt(`Error: Slide not found.`, true); // Pass message and error flag
          setTimeout(() => {
            commandMode = false;
            command = '';
            updatePrompt(':' + command); // Reset to normal prompt
          }, 2000);
        }
      } else if (e.key === 'Backspace') {
        command = command.slice(0, -1);
        updatePrompt(':' + command);
      } else if (e.key.length === 1 && !isNaN(parseInt(e.key, 10))) {
        command += e.key;
        updatePrompt(':' + command);
      } else if (e.key === 'Escape') {
        commandMode = false;
        command = '';
        updatePrompt(':' + command);
      }
      return;
    }

    if (e.key === 'g') {
      if (lastKey === 'g') {
        // gg
        if (slides.length > 0) {
          slides[0].scrollIntoView({ behavior: 'smooth' });
        }
        lastKey = '';
      } else {
        lastKey = 'g';
        setTimeout(() => { lastKey = '' }, 500); // reset after 500ms
      }
    } else if (e.key === 'G') {
      if (slides.length > 0) {
        slides[slides.length - 1].scrollIntoView({ behavior: 'smooth' });
      }
      lastKey = '';
    } else if (e.key === ':') {
      commandMode = true;
      command = '';
      lastKey = '';
      updatePrompt(':' + command);
    } else if (e.key === 'j') {
      window.scrollBy({ top: window.innerHeight * 0.1, behavior: 'smooth' });
      lastKey = '';
    } else if (e.key === 'k') {
      window.scrollBy({ top: -window.innerHeight * 0.1, behavior: 'smooth' });
      lastKey = '';
    } else if (e.key === 'u' && e.ctrlKey) {
      window.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' });
      lastKey = '';
    } else if (e.key === 'd' && e.ctrlKey) {
      window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
      lastKey = '';
    } else if ((e.key === 'f' || e.key === 'n') && e.ctrlKey) {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      lastKey = '';
    } else if ((e.key === 'b' || e.key === 'p') && e.ctrlKey) {
      window.scrollBy({ top: -window.innerHeight * 0.9, behavior: 'smooth' });
      lastKey = '';
    } else if (e.key === '?') {
      helpBox.style.display = helpBox.style.display === 'none' ? 'block' : 'none';
      lastKey = ''; // Reset lastKey to prevent unintended 'gg'
    } else {
      lastKey = '';
    }
  });
});
