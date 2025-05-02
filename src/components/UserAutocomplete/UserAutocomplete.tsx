import { useCallback, useMemo, useState } from "react";
import { useClientContext } from "../../providers/ClientProvider";
import { ParticipantOption, User } from "../../api/types/user";
import { Autocomplete as MuiAutocomplete, styled, TextField } from "@mui/material";
import { debounce, differenceBy } from "lodash";
import UserListItem, { getOptionLabel } from "./fragments/UserListItem";
import { UsersFindQueryParams } from "../../api/types/user";

const Autocomplete = styled(MuiAutocomplete)(({ theme }) => ({
  ".MuiFormLabel-root": {
    color: theme.palette.text.primary,
  },
})) as typeof MuiAutocomplete;

const AutocompleteTextField = styled(TextField)(({ theme }) => ({
  ".MuiInputBase-root": {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.secondary.dark,
  },
  "& .MuiSvgIcon-root": {
    color: `${theme.palette.secondary.dark} !important`,
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 1,
  },
}));

interface UserAutocompleteProps {
  selectedUsers: Array<ParticipantOption>;
  onUserSelect(user: ParticipantOption): void;
}

export const UserAutocomplete = ({ selectedUsers, onUserSelect }: UserAutocompleteProps) => {
  const client = useClientContext().client;
  const [foundUsers, setFoundUsers] = useState<Array<User>>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const debounceFindUsers = useCallback(
    debounce(async (inputValue: string) => {
      if (inputValue.length > 2) {
        const params: UsersFindQueryParams = { q: inputValue };
        const result = await client.users.find(params);
        setFoundUsers(result);
      }
    }, 250),
    []
  );

  const suggestedParticipants: Array<User> = useMemo(() => {
    if (searchValue.length < 3) {
      return [];
    }

    return differenceBy(foundUsers, selectedUsers, "email").sort((a, b) => {
      const aName = `${a.firstname} ${a.lastname}`;
      const bName = `${b.firstname} ${b.lastname}`;
      return aName.localeCompare(bName);
    });
  }, [foundUsers, selectedUsers, searchValue]);

  const searchEntryHandler = useCallback(
    (inputValue: string) => {
      setSearchValue(inputValue);
      debounceFindUsers(inputValue);
    },
    [debounceFindUsers]
  );

  const handleSelect = (selectedUser: ParticipantOption) => {
    onUserSelect(selectedUser);
    setFoundUsers([]);
    setSearchValue("");
  };

  const isValidEmailPredicate = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    return email.match(emailRegex);
  };

  const emailSuggestion = useMemo(() => {
    if (
      !selectedUsers.find((user) => user.email === searchValue) &&
      isValidEmailPredicate(searchValue)
    ) {
      return [{ email: searchValue }];
    }
    return [];
  }, [searchValue, selectedUsers]);

  return (
    <Autocomplete
      sx={{ marginTop: 2 }}
      options={
        suggestedParticipants.length
          ? (suggestedParticipants as ParticipantOption[])
          : (emailSuggestion as ParticipantOption[])
      }
      getOptionLabel={getOptionLabel}
      renderOption={(props, option) => (
        <UserListItem key={option.email} option={option} props={props} />
      )}
      inputValue={searchValue || ""}
      value={null}
      onChange={(_, value) => value && handleSelect(value)}
      onInputChange={(_, value) => searchEntryHandler(value || "")}
      noOptionsText="No options found"
      open={suggestedParticipants.length !== 0 || searchValue.length > 2}
      renderInput={({ InputProps, ...props }) => (
        <AutocompleteTextField
          {...props}
          label="Invite participants"
          variant="outlined"
          slotProps={{
            input: {
              ...InputProps,
              endAdornment: null,
            },
          }}
        />
      )}
    />
  );
};
