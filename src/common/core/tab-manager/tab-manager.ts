const tabId = (Math.random() * 100000).toString(16);
const TAB_EXPIRATION = 5 * 60 * 1000;

function setTab() {
	localStorage.setItem('activeTab', tabId);
	localStorage.setItem('tabDate', new Date().getTime().toString());
}

function checkTab() {
	const date = Number(localStorage.getItem('tabDate') || 0);
	if (!localStorage.getItem('activeTab') || new Date().getTime() - date > TAB_EXPIRATION) {
		setTab();
	}
}

checkTab();

window.addEventListener('storage', (event) => {
	if (event.key === 'activeTab' && !event.newValue) {
		checkTab();
	}
});

window.addEventListener('unload', () => {
	if (localStorage.getItem('activeTab') === tabId) {
		localStorage.removeItem('activeTab');
	}
});

function isActiveTab(): boolean {
	return localStorage.getItem('activeTab') === tabId;
}

export {isActiveTab};
