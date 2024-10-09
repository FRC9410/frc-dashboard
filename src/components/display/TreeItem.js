import React, { useState } from 'react';

// Recursive TreeItem component
const TreeItem = ({ nodeKey, data }) => {
  const [isOpen, setIsOpen] = useState(false); // Track whether this branch is collapsed

  const toggleOpen = () => {
    setIsOpen(!isOpen); // Toggle open/close
  };

  // Check if data is an object (for nested structures)
  const isObject = (val) => typeof val === 'object' && val !== null;

  return (
    <div style={{ marginLeft: '20px' }}>
      <div onClick={toggleOpen} style={{ cursor: 'pointer', fontWeight: isObject(data) ? 'bold' : 'normal' }}>
        {/* Display key with expand/collapse icon for objects */}
        {isObject(data) ? (isOpen ? '▼' : '▶') : null} {nodeKey}: {isObject(data) ? '' : JSON.stringify(data)}
      </div>

      {/* Recursively render children if the node is open */}
      {isObject(data) && isOpen && (
        <div>
          {Object.keys(data).map((childKey) => (
            <TreeItem key={childKey} nodeKey={childKey} data={data[childKey]} />
          ))}
        </div>
      )}
    </div>
  );
};
export default TreeItem;