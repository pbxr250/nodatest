
import React, { useState, useCallback, useRef, memo  } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any
};

interface IButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function Button({ onClick }: IButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      get random user
    </button>
  );
}

interface IUserInfoProps {
  user: User;
}

const UserInfo = memo(function UserInfo({ user }: IUserInfoProps): JSX.Element {
  
  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
})

/**
 * A custom React hook that throttles a callback function.
 *
 * @template T - The type of the callback function.
 * @param {T} callback - The callback function to be throttled.
 * @param {number} delay - The delay (in milliseconds) to throttle the function.
 * @returns {T} - The throttled callback function.
 */
function useThrottle<T extends (...args: any[]) => any>( callback: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledFunction = useCallback((...args: Parameters<T>) => {
    if (!timeoutRef.current) {
      callback(...args);
      timeoutRef.current = setTimeout(() => {
        if (timeoutRef.current)
          clearTimeout(timeoutRef.current)
        timeoutRef.current = null;
      }, delay);
    } 
  }, [callback, delay]) as T;

  return throttledFunction;
}




function App(): JSX.Element {
  const [item, setItem] = useState<User | null>(null);

  // For UI messages
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<string>('No users. Tap the button.');
  
  // Storing users in cache
  const cache = useRef(new Map());
  
  const receiveRandomUser = useThrottle(async () => {
    const id: number = Math.floor(Math.random() * (10 - 1)) + 1;
    // Checking cache
    if (cache.current.get(id)) {
      setItem(cache.current.get(id))
      return;
    }

    setIsLoading(true);
    setShowResult('Fetching user')
    try {
      const response = await fetch(`${URL}/${id}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const _user = (await response.json()) as User;
      cache.current.set(id, _user);
      setItem(_user);
    } catch (error) {
        setShowResult((error as Error).message)
    } finally {
        setIsLoading(false);
    }
  }, 1000);

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    receiveRandomUser();
    
  };

  const userInfo = (item && !isLoading)
  ? <UserInfo user={item} />   
  : <div>{showResult}</div>;

  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={handleButtonClick} />
      {userInfo}
    </div>
  );
}

export default App;