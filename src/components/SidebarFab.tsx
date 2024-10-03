import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {IconButton, SxProps} from '@mui/material';
import React from 'react';

interface FabProps {
  isCollapsed: boolean;
  onClick: () => void;
  sx?: SxProps;
}

const FloatingArrowSidebar: React.FC<FabProps> = ({
  isCollapsed,
  onClick: toggleSidebar,
  sx,
}) => {
  return (
    <IconButton
      onClick={toggleSidebar}
      sx={{
        position: 'absolute',
        top: 16,
        left: isCollapsed ? '16px' : '25vw',
        backgroundColor: 'primary.main',
        color: 'white',
        transition: 'left 0.3s ease', // Smooth transition for the button
        '&:hover': {backgroundColor: 'primary.dark'},
        ...sx,
      }}
    >
      {isCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
    </IconButton>
  );
};

export default FloatingArrowSidebar;
