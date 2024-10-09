import React from 'react';
import TreeItem from './TreeItem'

// Main TreeView component to render the robotData
const TreeView = ({ data }) => {
  return (
    <div>
      <h3>Robot Data</h3>
      <div>
        {Object.keys(data).map((key) => (
          <TreeItem key={key} nodeKey={key} data={data[key]} />
        ))}
      </div>
    </div>
  );
};

export default TreeView;