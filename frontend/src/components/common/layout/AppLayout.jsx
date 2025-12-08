import PropTypes from 'prop-types';

const LayoutApp = (props) => {
  const { children } = props;

  return <>{children}</>;
};

LayoutApp.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LayoutApp;
