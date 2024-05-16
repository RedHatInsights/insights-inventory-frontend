- [AppInfo](#AppInfo)
  - [componentMapper](#componentMapper)
  - [appList](#appList)
- [InventoryDetailHead](#InventoryDetailHead)
  - [actions](#actions)
  - [showTags](#showTags)
  - [hideInvLink](#hideInvLink)
  - [onTabSelect](#onTabSelect)
  - [onBackToListClick](#onBackToListClick)
  - [showDelete](#showDelete)
  - [showInventoryDrawer](#showInventoryDrawer)
  - [UUIDWrapper](#UUIDWrapper)
  - [LastSeenWrapper](#LastSeenWrapper)
  - [TitleWrapper](#TitleWrapper)
  - [TagsWrapper](#TagsWrapper)
  - [DeleteWrapper](#DeleteWrapper)
  - [ActionsWrapper](#ActionsWrapper)
    - [Wrapper](#Wrapper)
- [InventoryDetail](#InventoryDetail)
  - [getEntities](#getentities)
- [TagWithDialog](#TagWithDialog)
  - [count](#count)
  - [loadTags](#loadTags)
  - [systemId](#systemId)
- [DetailWrapper](#DetailWrapper)
  - [showInventoryDrawer](#showInventoryDrawer)
  - [isRbacEnabled](#isRbacEnabled)

# AppInfo

Default information about active application, when more than 1 application is provided it will automatically show tabs with each application.

## componentMapper

*elemnt*

An element to be shown when rendering a application information. Used to override default inventory detail wrapper.

## appList

*array*

Array of applications to be rendered when system detail is accessed.

# InventoryDetailHead

Detail information about currently observed system. It holds information about UUID, last seen, name and actions.

## actions

*array*

Additional actions used in inventory dropdown on right hand side of system detail.

## showTags

*boolean*

Toggle tags element, this will also add tags modal to see available tags on system.

## hideInvLink

*boolean*

Toggle to display inventory direct link, when active user will see action to navigate to full inventory view.

## onTabSelect

*function*

Callback function that is fired when user clicks on application tab.

## onBackToListClick

*function*

Callback function that is fired when user deletes currently observed system.

## showDelete

*boolean*

Toggle to display delete button for removing system from inventory DB.

## appList

*array*

Array of applications to be rendered when system detail is accessed.

## showInventoryDrawer

*boolean*

Toggle to show experimental inventory drawer

## UUIDWrapper

*element*

React element to be rendered as wrapper for UUID value.

## LastSeenWrapper

*element*

React element to be rendered as wrapper for Last seen value.

## TitleWrapper

*element*

React element to be rendered as wrapper for title value.

## TagsWrapper

*element*

React element to be rendered as wrapper for tags element value, including tags modal.

## DeleteWrapper

*element*

React element to be rendered as wrapper for rendering delete button.

## ActionsWrapper

*element*

React element to be rendered as wrapper for rendering actions.

### Wrapper
When using `UUIDWrapper`, `LastSeenWrapper`, `TitleWrapper`, `TagsWrapper`, `DeleteWrapper` or `ActionsWrapper` please consume props and use `children` otherwise the wrapped value won't be visible.

```JSX
import React from 'react';

const UUIDWrapper = ({ children }) => <div>This is UUID {children} value.</div>

// ... used in InventoryDetailHead component

<InventoryDetailHead
    store={store}
    history={history}
    fallback=""
    UUIDWrapper={({ children }) => <div>aaa {children}</div>}
/>
```

# InventoryDetail

Legacy component to show full inventory detail, please use `AppInfo` and `InventoryDetailHead` instead.

# TagWithDialog

Component to show tag count component and tag management dialog.

## count

*number*

Tag count to be shown both in tag element and in tag management dialog.

## loadTags

*function*

Redux connection function to select tags from redux store. Do not override unless you know what to do!

## systemId

*string*

ID of currently observed system, used for selecting tags from redux store based on this ID.

# DetailWrapper

## showInventoryDrawer

*boolean*

Toggle to enable inventory drawer.


## isRbacEnabled

*boolean*

Toggle to enable RBAC checks.
