package user

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *pgxpool.Pool
}

// compile-time check — Repository interface poori implement hui ya nahi
var _ Repository = &repository{}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, u *User) error {
	query := `
		INSERT INTO users (id, first_name, last_name, email, password, role, is_verified, token, refresh_token, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
	`
	_, err := r.db.Exec(ctx, query,
		u.ID, u.FirstName, u.LastName, u.Email,
		u.Password, u.Role, u.IsVerified, u.Token, u.RefreshToken,
	)
	return err
}

func (r *repository) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, first_name, last_name, profile_pic, profile_pic_public_id, email, password, role, token, refresh_token, is_verified, is_logged_in, otp, otp_expiry, address, city, zip_code, phone_no, created_at, updated_at FROM users WHERE email = $1`

	u := &User{}
	var profilePic, profilePicPublicID *string

	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.FirstName, &u.LastName, &profilePic, &profilePicPublicID,
		&u.Email, &u.Password, &u.Role, &u.Token, &u.RefreshToken, &u.IsVerified, &u.IsLoggedIn,
		&u.OTP, &u.OTPExpiry, &u.Address, &u.City, &u.ZipCode, &u.PhoneNo,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if profilePic != nil {
		u.ProfilePic = *profilePic
	}
	if profilePicPublicID != nil {
		u.ProfilePicPublicID = *profilePicPublicID
	}

	return u, nil
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	query := `SELECT id, first_name, last_name, profile_pic, profile_pic_public_id, email, password, role, token, refresh_token, is_verified, is_logged_in, otp, otp_expiry, address, city, zip_code, phone_no, created_at, updated_at FROM users WHERE id = $1`

	u := &User{}
	var profilePic, profilePicPublicID *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.FirstName, &u.LastName, &profilePic, &profilePicPublicID,
		&u.Email, &u.Password, &u.Role, &u.Token, &u.RefreshToken, &u.IsVerified, &u.IsLoggedIn,
		&u.OTP, &u.OTPExpiry, &u.Address, &u.City, &u.ZipCode, &u.PhoneNo,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if profilePic != nil {
		u.ProfilePic = *profilePic
	}
	if profilePicPublicID != nil {
		u.ProfilePicPublicID = *profilePicPublicID
	}

	return u, nil
}

func (r *repository) Update(ctx context.Context, u *User) error {
	query := `UPDATE users SET 
		first_name = $1, last_name = $2, profile_pic = $3, profile_pic_public_id = $4,
		token = $5, refresh_token = $6, is_verified = $7, is_logged_in = $8,
		otp = $9, otp_expiry = $10, address = $11, city = $12, zip_code = $13, phone_no = $14,
		password = $15, updated_at = NOW()
		WHERE id = $16`
	_, err := r.db.Exec(ctx, query,
		u.FirstName, u.LastName, u.ProfilePic, u.ProfilePicPublicID,
		u.Token, u.RefreshToken, u.IsVerified, u.IsLoggedIn,
		u.OTP, u.OTPExpiry, u.Address, u.City, u.ZipCode, u.PhoneNo,
		u.Password, u.ID,
	)
	return err
}
func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repository) CreateSession(ctx context.Context, session *Session) error {
	query := `
		INSERT INTO sessions (id, user_id, refresh_token, is_active, expires_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
	`
	_, err := r.db.Exec(ctx, query,
		session.ID, session.UserID, session.RefreshToken, session.IsActive, session.ExpiresAt,
	)
	return err
}

func (r *repository) GetSessionByRefreshToken(ctx context.Context, refreshToken string) (*Session, error) {
	query := `SELECT id, user_id, refresh_token, is_active, expires_at, created_at, updated_at FROM sessions WHERE refresh_token = $1`
	var s Session
	err := r.db.QueryRow(ctx, query, refreshToken).Scan(
		&s.ID, &s.UserID, &s.RefreshToken, &s.IsActive, &s.ExpiresAt, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *repository) UpdateSession(ctx context.Context, session *Session) error {
	query := `
		UPDATE sessions 
		SET refresh_token = $1, is_active = $2, expires_at = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query,
		session.RefreshToken, session.IsActive, session.ExpiresAt, session.ID,
	)
	return err
}

func (r *repository) GetAll(ctx context.Context) ([]*User, error) {
    query := `SELECT id, first_name, last_name, profile_pic, profile_pic_public_id, email, password, role, token, refresh_token, is_verified, is_logged_in, otp, otp_expiry, address, city, zip_code, phone_no, created_at, updated_at FROM users`
    rows, err := r.db.Query(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*User
    for rows.Next() {
        u := &User{}
        var profilePic, profilePicPublicID *string
        if err := rows.Scan(
            &u.ID, &u.FirstName, &u.LastName, &profilePic, &profilePicPublicID,
            &u.Email, &u.Password, &u.Role, &u.Token, &u.RefreshToken, &u.IsVerified, &u.IsLoggedIn,
            &u.OTP, &u.OTPExpiry, &u.Address, &u.City, &u.ZipCode, &u.PhoneNo,
            &u.CreatedAt, &u.UpdatedAt,
        ); err != nil {
            return nil, err
        }
        
        if profilePic != nil {
            u.ProfilePic = *profilePic
        }
        if profilePicPublicID != nil {
            u.ProfilePicPublicID = *profilePicPublicID
        }

        users = append(users, u)
    }
    return users, nil
}

func (r *repository) GetAllAdmins(ctx context.Context, searchQuery string) ([]*User, error) {
    var query string
    var args []interface{}

    if searchQuery != "" {
        query = `SELECT id, first_name, last_name, profile_pic, profile_pic_public_id, email, password, role, token, refresh_token, is_verified, is_logged_in, otp, otp_expiry, address, city, zip_code, phone_no, created_at, updated_at FROM users WHERE role = 'admin' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`
        searchTerm := "%" + searchQuery + "%"
        args = append(args, searchTerm)
    } else {
        query = `SELECT id, first_name, last_name, profile_pic, profile_pic_public_id, email, password, role, token, refresh_token, is_verified, is_logged_in, otp, otp_expiry, address, city, zip_code, phone_no, created_at, updated_at FROM users WHERE role = 'admin'`
    }

    rows, err := r.db.Query(ctx, query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*User
    for rows.Next() {
        u := &User{}
        var profilePic, profilePicPublicID *string
        if err := rows.Scan(
            &u.ID, &u.FirstName, &u.LastName, &profilePic, &profilePicPublicID,
            &u.Email, &u.Password, &u.Role, &u.Token, &u.RefreshToken, &u.IsVerified, &u.IsLoggedIn,
            &u.OTP, &u.OTPExpiry, &u.Address, &u.City, &u.ZipCode, &u.PhoneNo,
            &u.CreatedAt, &u.UpdatedAt,
        ); err != nil {
            return nil, err
        }
        
        if profilePic != nil {
            u.ProfilePic = *profilePic
        }
        if profilePicPublicID != nil {
            u.ProfilePicPublicID = *profilePicPublicID
        }

        users = append(users, u)
    }
    return users, nil
}

func (r *repository) DeleteSession(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM sessions WHERE user_id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	return err
}

func (r *repository) UpdateLogoutStatus(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE users SET token = NULL, refresh_token = NULL, is_logged_in = FALSE, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	return err
}
