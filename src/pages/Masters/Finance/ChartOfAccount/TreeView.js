import * as React from 'react';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import {
  RichTreeView,
  treeItemClasses,
  unstable_useTreeItem2 as useTreeItem2,
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2Icon,
  TreeItem2Provider,
  TreeItem2DragAndDropOverlay
} from '@mui/x-tree-view';
import {
  FolderRounded,
  FolderOpenRounded,
  DescriptionRounded,
  InsertDriveFileRounded,
  ArticleIcon,
  DeleteIcon,
  FolderOpenIcon,
  ImageIcon,
  PictureAsPdfIcon,
  VideoCameraBackIcon,
} from '@mui/icons-material';

function DotIcon() {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '70%',
        bgcolor: 'warning.main',
        display: 'inline-block',
        verticalAlign: 'middle',
        zIndex: 1,
        mx: 1,
      }}
    />
  );
}

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.grey[400],
  position: 'relative',
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: theme.spacing(3.5),
  },
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.spacing(0.7),
  margin: `${theme.spacing(0.5)} 0`,
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  fontWeight: 500,
  '&.Mui-expanded': {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
      color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
  },
  '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });
  return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontFamily: 'General Sans',
  fontWeight: 500,
});

function CustomLabel({ icon: Icon, expandable, children, ...other }) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}
      <StyledTreeItemLabelText variant="body2">{children}</StyledTreeItemLabelText>
      {expandable && <DotIcon />}
    </TreeItem2Label>
  );
}

const isExpandable = (reactChildren) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isExpandable);
  }
  return Boolean(reactChildren);
};

const CustomTreeItem = React.forwardRef((props, ref) => {
  const { id, itemId, label, disabled, children, onClick, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const expandable = isExpandable(children);
  const level = item.level; 
  let icon;
  switch (level) {
    case 0:
      icon = FolderRounded;
      break;
    case 1:
      icon = FolderOpenRounded;
      break;
    case 2:
      icon = DescriptionRounded;
      break;
    default:
      icon = InsertDriveFileRounded;
      break;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(item);
  };

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps(other)}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            }),
          })}
        >
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <CustomLabel
            onClick={handleClick}
            {...getLabelProps({
              icon,
              expandable: expandable && status.expanded,
              style: { paddingLeft: `${(level + 1) * 10}px` },
            })}
          />
          {/* <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} /> */}
        </CustomTreeItemContent>
        {children && <TransitionComponent {...getGroupTransitionProps()} />}
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  );
});

export default function TreeView({ callbackFunction, data }) {
  const firstNode = data?.[0];
  const firstChild = firstNode?.children?.[0];
  const defaultExpandedItems = firstNode ? [firstNode.id] : [];
  const defaultSelectedItems = firstChild ? [firstChild.id] : [];

  return (
    <RichTreeView
      items={data}
      defaultExpandedItems={defaultExpandedItems}
      defaultSelectedItems={defaultSelectedItems}
      sx={{ height: 'fit-content', flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      slots={{
        item: (props) => <CustomTreeItem {...props} onClick={callbackFunction} />,
      }}
    />
  );
}
