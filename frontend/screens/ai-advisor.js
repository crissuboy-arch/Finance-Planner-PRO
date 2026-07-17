(function () {
  'use strict';
  const g = globalThis;
  const SUGGESTIONS = [
    'How can I save more money?',
    'Should I pay off debt or save?',
    'Can I afford this purchase?',
    'How do I reduce expenses?',
    'How to improve my budget?'
  ];

  function renderMessages(msgs) {
    return msgs.map(function (m) {
      if (m.role === 'user') {
        return '<div class="chat-message user">' + escapeHtml(m.content) + '</div>';
      }
      return '<div class="chat-message ai">' + marked(m.content) + '</div>';
    }).join('');
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function marked(text) {
    if (!text) return '';
    var html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/### (.+)/g, '<h3>$1</h3>');
    html = html.replace(/## (.+)/g, '<h2>$1</h2>');
    html = html.replace(/# (.+)/g, '<h1>$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^- (.+)/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    return html;
  }

  g.FPScreens['ai-advisor'] = {
    init: function (container, _ref) {
      var onNavigate = _ref.onNavigate;
      var state = g.FPState;
      var messages = state.aiChat.slice();

      function scrollBottom() {
        var mc = document.getElementById('chatMessages');
        if (mc) mc.scrollTop = mc.scrollHeight;
      }

      function addMessage(role, content) {
        messages.push({ role: role, content: content });
        var mc = document.getElementById('chatMessages');
        if (mc) mc.innerHTML = renderMessages(messages);
        scrollBottom();
        g.FPState.aiChat = messages;
        g.saveState();
      }

      async function sendMessage(text) {
        if (!text.trim()) return;
        addMessage('user', text);
        var input = document.getElementById('chatInput');
        if (input) input.value = '';
        var typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        var mc = document.getElementById('chatMessages');
        if (mc) mc.appendChild(typing);
        scrollBottom();
        try {
          var resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'meta/llama-3.1-8b-instruct',
              messages: [
                { role: 'system', content: 'You are a professional financial advisor. Answer concisely with practical advice. Use markdown for emphasis. Be encouraging and helpful.' }
              ].concat(messages.slice(-10)),
              temperature: 0.7,
              max_tokens: 500,
              stream: true
            })
          });
          typing.remove();
          if (!resp.ok) {
            addMessage('ai', 'Sorry, the AI service is unavailable. Please try again.');
            return;
          }
          var reader = resp.body.getReader();
          var decoder = new TextDecoder();
          var aiText = '';
          var aiDiv = null;
          while (true) {
            var result = await reader.read();
            if (result.done) break;
            var chunk = decoder.decode(result.value, { stream: true });
            var lines = chunk.split('\n').filter(function (l) {
              return l.startsWith('data:') && l !== 'data: [DONE]';
            });
            for (var li = 0; li < lines.length; li++) {
              try {
                var json = JSON.parse(lines[li].replace('data:', ''));
                if (json.error) {
                  aiText = 'API error: ' + json.error;
                  break;
                }
                var delta = json.choices && json.choices[0] && json.choices[0].delta;
                if (delta && delta.content) {
                  aiText += delta.content;
                  if (!aiDiv) {
                    aiDiv = document.createElement('div');
                    aiDiv.className = 'chat-message ai';
                    var mc2 = document.getElementById('chatMessages');
                    if (mc2) mc2.appendChild(aiDiv);
                  }
                  aiDiv.innerHTML = marked(aiText);
                  scrollBottom();
                }
              } catch (e) { /* skip parse errors */ }
            }
          }
          if (aiDiv) {
            addMessage('ai', aiText);
          }
        } catch (e) {
          if (typing.parentNode) typing.remove();
          addMessage('ai', 'Connection error. Please check your internet and API key.');
        }
      }

      container.innerHTML =
        '<div class="screen active">' +
        '<div class="screen-header"><h1>AI Advisor</h1><button class="btn-icon" onclick="navigate(\'home\')">✕</button></div>' +
        '<div class="screen-body" style="display:flex;flex-direction:column;padding:0 16px;height:100%">' +
        '<div class="chat-messages" id="chatMessages">' + renderMessages(messages) + '</div>' +
        '<div class="chat-suggestions" id="chatSuggestions">' +
        SUGGESTIONS.map(function (s) {
          return '<button class="chat-suggestion">' + s + '</button>';
        }).join('') +
        '</div>' +
        '<div class="chat-input-bar">' +
        '<input type="text" id="chatInput" placeholder="Ask about your finances..." autocomplete="off">' +
        '<button class="btn btn-primary" id="sendBtn">➤</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      document.getElementById('sendBtn').addEventListener('click', function () {
        var inp = document.getElementById('chatInput');
        sendMessage(inp ? inp.value : '');
      });
      document.getElementById('chatInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var inp = document.getElementById('chatInput');
          sendMessage(inp ? inp.value : '');
        }
      });
      var suggestions = document.querySelectorAll('.chat-suggestion');
      for (var si = 0; si < suggestions.length; si++) {
        (function (btn) {
          btn.addEventListener('click', function () { sendMessage(btn.textContent); });
        })(suggestions[si]);
      }
      scrollBottom();
    }
  };
})();