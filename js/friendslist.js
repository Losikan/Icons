document.addEventListener('DOMContentLoaded', function () {
    function findListItemByText(list, text) {
        return Array.from(list.children).find(li => getUsername(li) === text);
    }

    function getUsername(li) {
        return li.childNodes[0].nodeValue.trim();
    }

    function resetChat() {
        currentUser = null;
        document.querySelectorAll('li.selected').forEach(li => li.classList.remove('selected'));
        renderMessages();
        toggleChatVisibility();
    }

    function toggleChatVisibility() {
        const friendsChat = document.querySelector('.friends-chat');
        const friendsList = document.querySelector('.friends-list');
        if (window.innerWidth <= 700) {
            if (currentUser) {
                friendsChat.style.display = 'block';
                friendsList.style.display = 'none';
            } else {
                friendsChat.style.display = 'none';
                friendsList.style.display = 'block';
            }
        } else {
            friendsChat.style.display = 'block';
            friendsList.style.display = 'block';
        }
        toggleBackButtonVisibility();
    }

    function toggleBackButtonVisibility() {
        const chatBack = document.querySelector('.chat-back');
        if (window.innerWidth <= 700) {
            chatBack.style.display = currentUser ? 'block' : 'none';
        } else {
            chatBack.style.display = 'none';
        }
    }

    function handleBackButtonClick() {
        resetChat();
    }

    function updateChatHeaderIcons() {
        const chatIcons = document.querySelector('.chat-icons');
        chatIcons.innerHTML = '';

        if (currentUser) {
            const isBlocked = findListItemByText(document.getElementById('blocked-list'), currentUser);
            const isFriend = findListItemByText(document.getElementById('online-list'), currentUser) ||
                             findListItemByText(document.getElementById('offline-list'), currentUser);

            if (!isFriend && !isBlocked) {
                const addFriendIcon = document.createElement('i');
                addFriendIcon.className = 'ri-user-add-fill';
                addFriendIcon.addEventListener('click', () => {
                    const onlineList = document.getElementById('online-list');
                    const newFriend = document.createElement('li');
                    newFriend.innerHTML = `${currentUser}<i class="ri-user-minus-fill"></i>`;
                    onlineList.appendChild(newFriend);
                    document.getElementById('online-count').textContent = onlineList.children.length;
                    updateChatHeaderIcons();
                });
                chatIcons.appendChild(addFriendIcon);
            }

            const flagIcon = document.createElement('i');
            flagIcon.className = 'ri-flag-fill';
            flagIcon.addEventListener('click', () => {
                reportModal.style.display = 'flex';
            });
            chatIcons.appendChild(flagIcon);

            const spamIcon = document.createElement('i');
            spamIcon.className = 'ri-spam-3-fill';
            spamIcon.addEventListener('click', () => {
                handleBlockUser(currentUser, !isBlocked);
                updateChatHeaderIcons();
            });
            chatIcons.appendChild(spamIcon);
        }
    }

    // Create the report modal
    const reportModal = document.createElement('div');
    reportModal.className = 'report-modal';
    reportModal.innerHTML = `
        <div class="report-content">
            <h3>Rapporteer deze gebruiker</h3>
            <textarea id="reportReason" placeholder="Schrijf een reden in..."></textarea>
            <div class="report-buttons">
                <button id="cancelReport">Annuleren</button>
                <button id="submitReport">Rapporteren</button>
            </div>
        </div>
    `;
    document.body.appendChild(reportModal);

    // Add event listeners for the modal buttons
    document.getElementById('cancelReport').addEventListener('click', () => {
        reportModal.style.display = 'none';
        document.getElementById('reportReason').value = ''; // Clear the textarea
    });

    document.getElementById('submitReport').addEventListener('click', () => {
        const reason = document.getElementById('reportReason').value;
        if (reason.trim()) {
            console.log('Report submitted for:', currentUser, 'Reason:', reason);
            // Add your report submission logic here
        }
        reportModal.style.display = 'none';
        document.getElementById('reportReason').value = ''; // Clear the textarea
    });

    function reattachEventListeners() {
        document.querySelectorAll('#online-list li, #offline-list li, #blocked-list li').forEach(li => {
            li.removeEventListener('click', handleUserSelection); 
            li.addEventListener('click', handleUserSelection);
        });

        document.querySelectorAll('.ri-user-minus-fill').forEach(icon => {
            icon.removeEventListener('click', handleFriendRemove);
            icon.addEventListener('click', handleFriendRemove);
        });

        document.querySelectorAll('#blocked-list .ri-spam-3-fill').forEach(icon => {
            icon.removeEventListener('click', handleUnblock);
            icon.addEventListener('click', handleUnblock);
        });

        const backButton = document.querySelector('.chat-back i');
        backButton.removeEventListener('click', handleBackButtonClick);
        backButton.addEventListener('click', handleBackButtonClick);
    }

    function handleUserSelection() {
        const username = getUsername(this);
        if (currentUser === username) return;

        document.querySelectorAll('li.selected').forEach(item => item.classList.remove('selected'));
        this.classList.add('selected');
        currentUser = username;

        chatUsername.textContent = currentUser;
        chatStatus.textContent = this.closest('ul').id.replace('-list', '');

        void chatUsername.offsetHeight;

        chatUsername.style.opacity = '1';
        chatStatus.style.opacity = '1';

        updateChatHeaderIcons();
        renderMessages();
        toggleChatVisibility();
    }

    function handleFriendRemove(e) {
        e.stopPropagation();
        const li = this.closest('li');
        const wasSelected = li.classList.contains('selected');
        const list = li.closest('ul'); // Get the parent list (online-list, offline-list, or blocked-list)
    
        // Update the counter for the respective list
        const countElement = list.previousElementSibling.querySelector('.count');
        if (countElement) {
            countElement.textContent = list.children.length - 1; // Subtract 1 because we're about to remove the item
        }
    
        // Remove the list item
        li.remove();
    
        // Reset chat if the removed user was selected
        if (wasSelected) resetChat();
    
        // Reattach event listeners
        reattachEventListeners();
    }

    function handleBlockUser(username, shouldBlock) {
        const blockList = document.getElementById('blocked-list');
        const wasSelected = currentUser === username;

        if (shouldBlock) {
            let li = findListItemByText(document.getElementById('online-list'), username) ||
                     findListItemByText(document.getElementById('offline-list'), username);

            if (li) {
                li.closest('ul').previousElementSibling.querySelector('.count').textContent--;
                li.remove();
            }

            const newBlock = document.createElement('li');
            newBlock.innerHTML = `${username}<i class="ri-spam-3-fill"></i>`;
            blockList.appendChild(newBlock);
            blockList.previousElementSibling.querySelector('.count').textContent++;
        } else {
            const li = findListItemByText(blockList, username);
            if (li) li.remove();
            blockList.previousElementSibling.querySelector('.count').textContent--;
        }

        if (wasSelected) resetChat();
        reattachEventListeners();
    }

    function handleUnblock(e) {
        e.stopPropagation();
        const li = e.target.closest('li');
        const username = getUsername(li);
        li.remove();
        document.getElementById('blocklist-count').textContent =
            document.getElementById('blocked-list').children.length;
        if (currentUser === username) resetChat();
        reattachEventListeners();
    }

    document.getElementById('query').addEventListener('input', function () {
        const term = this.value.toLowerCase();
        document.querySelectorAll('.friends-list-users ul').forEach(ul => {
            let visibleCount = 0;
            ul.querySelectorAll('li').forEach(li => {
                const matches = getUsername(li).toLowerCase().includes(term);
                li.classList.toggle('hidden', !matches);
                if (matches) visibleCount++;
            });
            ul.previousElementSibling.querySelector('.count').textContent = visibleCount;
        });
    });

    document.querySelectorAll('.friends-list-users h1').forEach(header => {
        header.addEventListener('click', () => {
            header.nextElementSibling.classList.toggle('collapsed');
        });
    });

    const messages = {};
    let currentUser = null;
    const friendsChat = document.querySelector('.friends-chat');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const chatUsername = document.getElementById('chatUsername');
    const chatStatus = document.getElementById('chatStatus');
    const sendButton = document.getElementById('sendButton');

    function renderMessages() {
        chatMessages.style.transition = 'none';
        chatMessages.style.opacity = '0';
        chatMessages.style.transform = 'translateY(10px)';

        requestAnimationFrame(() => {
            chatMessages.innerHTML = '';

            if (!currentUser) {
                chatMessages.classList.remove('active');
                friendsChat.classList.remove('active');
                messageInput.disabled = true;
                sendButton.disabled = true;

                const placeholder = document.createElement('div');
                placeholder.className = 'chat-placeholder';
                placeholder.innerHTML = `
                    <i class="ri-message-3-line"></i>
                    <p>Kies een persoon om te beginnen chatten</p>
                `;
                chatMessages.appendChild(placeholder);

                chatMessages.style.opacity = '1';
                chatMessages.style.transform = 'none';
                return;
            }

            chatMessages.classList.add('active');
            friendsChat.classList.add('active');
            messageInput.disabled = false;
            sendButton.disabled = false;

            chatMessages.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
            chatMessages.style.opacity = '0';
            chatMessages.style.transform = 'translateY(10px)';

            requestAnimationFrame(() => {
                if (messages[currentUser]) {
                    messages[currentUser].forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `message ${msg.sender}`;

                        if (msg.sender === 'recipient') {
                            messageDiv.innerHTML = '<div class="avatar"></div>';
                        }

                        const bubble = document.createElement('div');
                        bubble.className = 'bubble';
                        bubble[msg.type === 'text' ? 'textContent' : 'innerHTML'] =
                            msg.type === 'text' ? msg.content : `<img src="${msg.content}" class="message-image">`;

                        messageDiv.appendChild(bubble);
                        chatMessages.appendChild(messageDiv);
                    });
                }

                chatMessages.style.opacity = '1';
                chatMessages.style.transform = 'translateY(0)';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        });
    }

    function sendMessage() {
        if (!currentUser) return;
        const message = messageInput.value.trim();

        if (message) {
            if (!messages[currentUser]) messages[currentUser] = [];
            messages[currentUser].push({
                content: message,
                type: 'text',
                sender: 'sender'
            });
            messageInput.value = '';
            renderMessages();
        }
    }

    document.getElementById('file').addEventListener('change', function (e) {
        if (!currentUser) return;
        const file = e.target.files[0];

        if (file?.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = evt => {
                if (!messages[currentUser]) messages[currentUser] = [];
                messages[currentUser].push({
                    content: evt.target.result,
                    type: 'image',
                    sender: 'sender'
                });
                renderMessages();
            };
            reader.readAsDataURL(file);
        }
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function initializeChat() {
        chatMessages.style.opacity = '1';
        friendsChat.classList.remove('active');
        renderMessages();

        setTimeout(() => {
            chatMessages.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
        }, 100);

        window.addEventListener('resize', toggleChatVisibility);

        toggleBackButtonVisibility();
    }

    document.querySelectorAll('#online-list li, #offline-list li, #blocked-list li').forEach(li => {
        messages[getUsername(li)] = [];
    });

    initializeChat();
    reattachEventListeners();
    updateChatHeaderIcons();
    toggleChatVisibility();
});