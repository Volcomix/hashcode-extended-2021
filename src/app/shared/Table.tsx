import React from 'react';
import './Table.css';

type TableProps = {
  children: React.ReactNode;
};

function Table({ children }: TableProps) {
  return (
    <div className="Table">
      <table>{children}</table>
    </div>
  );
}

export default Table;
