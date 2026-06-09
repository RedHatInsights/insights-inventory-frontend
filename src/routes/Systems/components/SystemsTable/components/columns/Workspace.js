import PropTypes from 'prop-types';

const Workspace = ({ groups }) => groups?.[0]?.name;

Workspace.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    }).isRequired,
  ),
};
export default Workspace;
