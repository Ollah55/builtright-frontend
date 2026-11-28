const logo = '../src/assets/logoooo.png';
const nav = ['Dashboard','Customers','Projects','Quotations','Invoices','Installers','Sales team','Devices','Accounting'];
const screens = [];

const shell = ({id,file,title,subtitle,active='Dashboard',role='Admin Portal',user='Anita Agary',body}) => `
  <section class="screen" id="${id}" data-file="${file}">
    <div class="shell">
      <aside class="sidebar">
        <div class="side-logo"><img src="${logo}"></div>
        <p class="portal-name">${role}</p>
        ${nav.map((name)=>`<div class="navitem ${name===active?'active':''}"><span class="navdot"></span>${name}</div>`).join('')}
        <div class="side-user"><strong>${user}</strong><span>Signed in securely</span></div>
      </aside>
      <div class="main">
        <header class="topbar"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="top-actions"><span class="badge blue">Presentation preview · Sample data</span><span class="btn">Notifications 3</span></div></header>
        <div class="content">${body}</div>
      </div>
    </div>
    <div class="footer-note">BuiltRight Services Ltd · Confidential workflow preview</div>
  </section>`;

const timeline = (steps) => `<div class="timeline">${steps.map((step,index)=>`<div class="step ${step.state||''}"><i>${step.state==='done'?'✓':index+1}</i><strong>${step.title}</strong><span>${step.caption}</span></div>`).join('')}</div>`;
