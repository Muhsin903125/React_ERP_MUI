

import { Avatar } from '@mui/material';

export default function StringAvatar(props) {
    const { string, ...other } = props;
    return (
      <Avatar {...other}>
        {string.split(' ').map((word) => word[0]).join('')}
      </Avatar> 
    );
  };
  
