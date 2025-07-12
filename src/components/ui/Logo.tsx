import FilterAltIcon from '@mui/icons-material/FilterAlt';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo = ({ size = 'md', showText = true, className = '', variant = 'light' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: '20px',
    md: '24px',
    lg: '36px'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const textGradient = variant === 'dark' 
    ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg`}>
        <FilterAltIcon 
          sx={{ 
            fontSize: iconSizes[size], 
            color: 'white',
            transform: 'rotate(0deg)' 
          }} 
        />
      </div>
      
      {showText && (
        <span className={`${textSizes[size]} font-semibold ${textGradient}`}>
          LeadConverter
        </span>
      )}
    </div>
  );
};
