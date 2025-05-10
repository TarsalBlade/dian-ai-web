// Typing animation function
  function typeText(element, text, speed = 30) {
    element.innerHTML = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  async function sendMessage(userInput) {
    const responseParagraph = document.querySelector('.info-card p');
    responseParagraph.textContent = "Dian is thinking...";

    try {

      const keyResponse = await fetch('/api/key');
    if (!keyResponse.ok) {
      throw new Error('Failed to fetch API key');
    }
    const keyData = await keyResponse.json();
    const apiKey = keyData.apiKey;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
          messages: [
            {
              role: "system",
              content: "From now on your name is Dian from Diantech AI Solutions, and introduce yourself."
            },
            {
              role: "user",
              content: userInput
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Assuming the response structure contains the AI message in data.choices[0].message.content
      const aiMessage = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

      if (aiMessage) {
        // Use marked to parse markdown and then type the HTML content
        const htmlContent = marked.parse(aiMessage);
        // Clear existing content
        responseParagraph.innerHTML = "";
        // Create a temporary element to hold the HTML content for typing animation
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Function to type HTML content with tags
        function typeHTML(element, container, speed = 20, callback) {
          let nodes = Array.from(container.childNodes);
          let i = 0;

          function typeNode() {
            if (i >= nodes.length) {
              if (callback) callback();
              return;
            }
            let node = nodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
              let text = node.textContent;
              let j = 0;
              function typeChar() {
                if (j < text.length) {
                  element.appendChild(document.createTextNode(text.charAt(j)));
                  j++;
                  setTimeout(typeChar, speed);
                } else {
                  i++;
                  typeNode();
                }
              }
              typeChar();
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              let el = document.createElement(node.nodeName);
              // Copy attributes
              for (let attr of node.attributes) {
                el.setAttribute(attr.name, attr.value);
              }
              element.appendChild(el);
              typeHTML(el, node, speed, () => {
                i++;
                typeNode();
              });
            } else {
              i++;
              typeNode();
            }
          }
          typeNode();
        }

        typeHTML(responseParagraph, tempDiv, 15);
      } else {
        responseParagraph.textContent = "No response from AI.";
      }
    } catch (error) {
      responseParagraph.textContent = `Error: ${error.message}`;
    }
  }

  document.querySelector('.send-button').addEventListener('click', async () => {
    const inputField = document.querySelector('.input-text');
    const userInput = inputField.value.trim();

    if (!userInput) {
      const responseParagraph = document.querySelector('.info-card p');
      responseParagraph.textContent = "Please enter a message.";
      return;
    }

    await sendMessage(userInput);

    inputField.value = "";
  });

  // Run initial prompt on page load
  window.addEventListener('DOMContentLoaded', () => {
    sendMessage("From now on your name is Dian from Diantech AI Solutions, and introduce yourself.");
  });