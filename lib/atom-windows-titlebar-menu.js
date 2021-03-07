'use babel'

export default class AtomWindowsTitlebarMenu {
   constructor(){
      // Build The Menus
      this.buildTheMenuHTML()
      // Listen for events
      setTimeout(() => { this.listenForMenuEvents() }, 0)
      this.altkeyoverride()
   }

   altkeyoverride(){
      // This is going to get a bit dangerous. Watch for key up/down. Bluring Resets
      // On keyup check for alt key and make sure the sequence isnt a multi
      var keysDown = { count: 0, multi: false }
      document.body.addEventListener('keydown', (e) => {
         if(keysDown.count) keysDown.multi = true
         if(!e.repeat) keysDown.count++
      })
      document.body.addEventListener('keyup', (e) => {
         if(e.key == 'Alt' && !keysDown.multi) this.toggleMenu()
         keysDown.count--
         if(!keysDown.count) keysDown.multi = false
      })
      window.addEventListener('blur', () => {
         keysDown = { count: 0, multi: false }
      })
   }
   
   // Add the menubar
   buildTheMenuHTML(){
      this.clearMenuBar()
      this.menus = atom.menu.packageManager.menuManager.template
      this.container = document.createElement('div')
      this.container.setAttribute('class', 'atom-windows-titlebar-menu-container')
      document.querySelector('.workspace').prepend(this.container)
      this.buildMenus()
   }

   clearMenuBar(){
      if(this.container) document.querySelector('.workspace').removeChild(this.container)
   }

   listenForMenuEvents(){
      var menuItems = document.querySelectorAll('.atom-windows-titlebar-menu-container .submenu-item')
      for(var i = 0; i < menuItems.length; i++){
         menuItems[i].addEventListener('mousedown', function(){
            var target = atom.views.getView(atom.workspace.getActiveTextEditor())
            var command = this.getAttribute('data-command')
            var target = atom.views.getView(atom.workspace.getActivePane())
            atom.commands.dispatch(target, command)
         })
      }
   }

   // Build the menu and submenus
   buildMenus(){
      for(var menu of this.menus)
         this.container.innerHTML += this.buildMenu(menu)
   }

   buildMenu(menu){
      var submenuHTML = menu.submenu ? this.buildSubMenuHTML(menu.submenu) : ''
      return `
         <div class='menu'>
            <label>${menu.label.split('&').join('')}</label>
            ${submenuHTML}
         </div>`
   }

   buildSubMenuHTML(submenu){
      var html = ''
      for(var item of submenu){
         if(item.type == 'separator'){ html += `<hr>`; continue }
         html += `
            <div class='submenu-item ${item.submenu ? 'has-submenu' : ''}' data-command="${item.command}">
               <span class="label">${item.label.split('&').join('')}</span>
               ${this.getCommandKeyBind(item.command)}
               ${item.submenu ? this.buildSubMenuHTML(item.submenu) : ''}
            </div>`
      }
      return `<div class='submenu'>${html}</div>`
   }

   getCommandKeyBind(command){
      var keys = atom.menu.packageManager.menuManager.keymapManager.keyBindings
      var keymap = ''
      for(var key of keys){
         if(command && key.keystrokeArray.length == 1 && key.command == command){
            // Return 'cmd-shift-i' as 'Cmd-Shift-I'
            keymap = key.keystrokeArray[0].split('-').map(function(e){
               return e.slice(0, 1).toUpperCase() + e.slice(1, e.length).toLowerCase()
            }).join('-')
         }
      }

      return keymap == '' ? keymap : `<span class="keymap">${keymap}</span>`
   }

   toggleMenu(){
      this.container.classList.toggle('show')
   }
   deactivate(){
     this.clearMenuBar()
   }
}
